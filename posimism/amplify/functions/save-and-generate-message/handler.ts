import { generateClient } from "aws-amplify/data";
import type { Schema } from "./../../data/resource";
import { AppSyncIdentityCognito } from "aws-lambda";
import { OpenAI } from "openai";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/save-and-generate-message"; // replace with your function name
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);

const ai = new OpenAI({
  apiKey:
    "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",
});

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["createMessage"]["functionHandler"] = async (
  event,
  context
) => {
  const {
    arguments: { chatID, msg },
  } = event;
  const identity = event.identity as AppSyncIdentityCognito;
  if (!identity || !identity.sub) {
    throw new Error("Unauthorized");
  }

  const chatMetadataPromise = client.models.AIChat.get({ id: chatID });

  const existingMessagesPromise =
    client.models.AiChatMessage.listAiChatMessageByChatIDAndCreatedAt(
      { chatID },
      { sortDirection: "DESC" }
    );
  const { data: chatOwner } = await chatMetadataPromise;
  if (!chatOwner || chatOwner.owner !== identity.sub) {
    throw new Error("Unauthorized");
  }

  const createMessagePromise = client.models.AiChatMessage.create({
    chatID,
    msg,
    owner: identity.sub,
    isAi: false,
    createdAt: Math.round(Date.now() / 1000),
  });

  // Type instantiation is excessively deep and possibly infinite.ts(2589)
  // type msgCreateType = ReturnType<typeof client.models.AiChatMessage.create>;
  type msgCreateType = Promise<{
    data: {
      readonly owner: string;
      readonly id: string;
      readonly createdAt: number;
      readonly chatID: string;
      readonly isAi: boolean;
      readonly msg: string | null;
      readonly streaming: boolean | null;
    } | null;
    errors?: Array<{ message: string }>;
    extensions?: Record<string, any>;
  }>;
  let aiMessagePromise: msgCreateType;
  const upsertMessage = async (msg: string, done: boolean = false) => {
    const {
      errors,
      data: aiMessage,
      extensions,
    } = (await aiMessagePromise) || {};
    if (!aiMessagePromise || !aiMessage?.id) {
      aiMessagePromise = client.models.AiChatMessage.create(
        {
          createdAt: Math.round(Date.now() / 1000),
          chatID,
          owner: identity.sub,
          isAi: true,
          msg,
          streaming: !done,
        },
        {
          selectionSet: [
            "id",
            "createdAt",
            "chatID",
            "owner",
            "isAi",
            "msg",
            "streaming",
          ],
        }
      );
      return;
    }
    client.models.AiChatMessage.update({
      ...aiMessage,
      streaming: !done,
      msg,
    });
  };

  const formattedMessages = (await existingMessagesPromise).data.map((msg) => ({
    role: msg.isAi ? "assistant" : ("user" as "assistant" | "user"),
    content: msg.msg,
  }));
  const aiMsgStream = ai.beta.chat.completions.stream({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "" },
      ...formattedMessages,
      { role: "user", content: msg },
    ],
    stream: true,
  });

  let aiResponse = "";
  for await (const chunk of aiMsgStream) {
    const content = chunk.choices[0]?.delta?.content;
    aiResponse += content;
    await upsertMessage(aiResponse, !content);
  }
  await createMessagePromise;
};
