import { a } from "@aws-amplify/backend";
import { saveAndGenerateAiMessage } from "../../functions/save-and-generate-AiMessage/resource";

export const AIChat = {
  AIChat: a
    .model({
      id: a.id().required(),
      createdAt: a
        .datetime()
        .authorization((allow) => [
          allow.owner().to(["read"]),
          allow.guest().to(["read"]),
        ]),
      owner: a
        .string()
        .required()
        .authorization((allow) => [
          allow.owner().to(["create", "read"]),
          allow.guest().to(["create", "read"]),
        ]),
      name: a.string(),
      messages: a.hasMany("AiChatMessage", "chatId"),
    })
    .authorization((allow) => [
      allow.owner().to(["create", "read", "update"]),
      allow.guest().to(["create", "read", "update"]),
    ])
    .secondaryIndexes((index) => [index("owner").sortKeys(["createdAt"])])
    .identifier(["id"]),
  AiChatMessage: a
    .model({
      id: a.id().required(),
      createdAt: a.datetime().required(),
      chatId: a.id().required(),
      chat: a.belongsTo("AIChat", "chatId"),
      owner: a.string().required(),
      isAi: a.boolean().required(),
      msg: a.string().required(),
      streaming: a.boolean(),
      quickReplies: a.hasMany("AiQuickReply", "msgId"),
    })
    .identifier(["id"])
    .secondaryIndexes((index) => [index("chatId").sortKeys(["createdAt"])])
    .authorization((allow) => [
      allow.owner().to(["read"]),
      allow.guest().to(["read"]),
    ]),
  createAiMessage: a
    .mutation()
    .arguments({
      chatId: a.id().required(),
      msg: a.string().required(),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .returns(a.ref("AiChatMessage"))
    .handler(a.handler.function(saveAndGenerateAiMessage).async()),
  AiQuickReply: a
    .model({
      msgId: a.id().required(),
      owner: a.string().required(),
      value: a.string().required(),
      msg: a.belongsTo("AiChatMessage", "msgId"),
    })
    .identifier(["msgId"])
    .secondaryIndexes((index) => [index("value").sortKeys(["owner"])])
    .authorization((allow) => [allow.owner(), allow.guest()]),
};
