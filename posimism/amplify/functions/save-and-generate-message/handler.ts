import { generateClient } from "aws-amplify/data";
import type { Schema } from "./../../data/resource";
import { AppSyncIdentityCognito } from "aws-lambda";
import { OpenAI } from "openai";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/save-and-generate-message";

// Get configuration and set up clients
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

// Use environment variables for API key in production
const ai = new OpenAI({
  // apiKey: process.env.OPENAI_API_KEY || "your-api-key-placeholder",
  apiKey:
    "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",
});

export const handler: Schema["createMessage"]["functionHandler"] = async (
  event
) => {
  const {
    arguments: { chatID, msg },
  } = event;
  const identity = event.identity as AppSyncIdentityCognito;

  // Validate user authentication
  if (!identity?.sub) {
    throw new Error("Unauthorized");
  }

  // Verify chat ownership and fetch messages in parallel
  const [chatMetadata, existingMessages] = await Promise.all([
    client.models.AIChat.get({ id: chatID }),
    client.models.AiChatMessage.listAiChatMessageByChatIDAndCreatedAt(
      { chatID },
      { sortDirection: "DESC" }
    ),
  ]);

  // Verify chat ownership
  if (!chatMetadata.data || chatMetadata.data.owner !== identity.sub) {
    throw new Error("Unauthorized");
  }

  // Save user message
  await client.models.AiChatMessage.create({
    chatID,
    msg,
    owner: identity.sub,
    isAi: false,
    createdAt: new Date().toISOString(),
  });

  // Prepare formatted message history for AI
  const formattedMessages = existingMessages.data.map((msg) => ({
    role: msg.isAi ? ("assistant" as const) : ("user" as const),
    content: msg.msg,
  }));

  // First create the AI message record with empty content
  const initialAiMsg = await client.models.AiChatMessage.create({
    createdAt: new Date().toISOString(),
    chatID,
    owner: identity.sub,
    isAi: true,
    msg: "",
    streaming: true,
  });

  if (!initialAiMsg.data?.id) {
    throw new Error("Failed to create AI response message");
  }

  let aiResponse = "";
  // Now stream the AI response and update the same record
  try {
    const aiMsgStream = ai.beta.chat.completions.stream({
      model: "gpt-4o-mini",
      messages: [
        // Add system prompt if needed
        // { role: "system", content: "Your system instructions here" },
        ...formattedMessages,
        { role: "user", content: msg },
      ],
      stream: true,
    });
    for await (const chunk of aiMsgStream) {
      const content = chunk.choices[0]?.delta?.content || "";
      aiResponse += content;

      // Only update if we have new content to reduce database operations
      if (content) {
        await client.models.AiChatMessage.update({
          id: initialAiMsg.data.id,
          chatID,
          msg: aiResponse,
          streaming: true,
        });
      }
    }

    // Mark as complete once done
    await client.models.AiChatMessage.update({
      id: initialAiMsg.data.id,
      chatID,
      msg: aiResponse,
      streaming: false,
    });
  } catch (error) {
    // Handle streaming errors
    await client.models.AiChatMessage.update({
      id: initialAiMsg.data.id,
      chatID,
      msg:
        `${aiResponse}\n-----\nSorry, I encountered an error finishing my response.` ||
        "Sorry, I encountered an error generating a response.",
      streaming: false,
    });
    console.error("AI streaming error:", error);
  }
};
