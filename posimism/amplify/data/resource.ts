import {
  type ClientSchema,
  a,
  defineData,
} from "@aws-amplify/backend";
import { saveAndGenerateAiMessage } from "../functions/save-and-generate-Aimessage/resource";

const schema = a
  .schema({
    AiChat: a
      .model({
        id: a.id().required(),
        createdAt: a
          .datetime()
          .authorization((allow) => [allow.owner().to(["read"]), allow.guest().to(["read"])]),
        owner: a
          .string()
          .required()
          .authorization((allow) => [allow.owner().to(["create","read"]), allow.guest().to(["create","read"])]),
        model: 
          a.string()
          .authorization(() => []),
        prompt:
          a.string()
          .authorization(() => []),
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
        chat: a.belongsTo("AiChat", "chatId"),
        owner: a.string().required(),
        isAi: a.boolean().required(),
        msg: a.string().required(),
        streaming: a.boolean(),
        quickReplies: a.hasMany("QuickReply", "msgId"),
      })
      .identifier(["id"])
      .secondaryIndexes((index) => [index("chatId").sortKeys(["createdAt"])])
      .authorization((allow) => [allow.owner().to(["read"]), allow.guest().to(["read"])]),
    createMessage: a
      .mutation()
      .arguments({
        chatID: a.id().required(),
        msg: a.string().required(),
      })
      .authorization((allow) => [allow.guest(), allow.authenticated()])
      .returns(a.ref("AiChatMessage"))
      .handler(a.handler.function(saveAndGenerateAiMessage).async()),
    // bulkSendMessage: a
    //   .mutation()
    //   .arguments({
    //     chatIds: a.id().array().required(),
    //     msg: a.string().required(),
    //   })
    //   .authorization((allow) => [allow.group("Admin")])
    //   .returns(a.ref("AiChatMessage"))
    //   .handler([
    //     a.handler.custom({
    //       dataSource: a.ref("AiChat"),
    //       entry: "./getAiChats.js",
    //     }),
    //     // a.handler.custom({
    //     //   entry: "./checkOwnerships.js",
    //     // }),
    //     a.handler.custom({
    //       dataSource: a.ref("saveAndGenerateAiMessagesSource"),
    //       entry:"./triggerSaveAndGenerateAiMessages.js"
    //     })]),
    QuickReply: a
      .model({
        msgId: a.id().required(),
        owner: a.string().required(),
        value: a.string().required(),
        msg: a.belongsTo("AiChatMessage", "msgId"),
      })
      .identifier(["msgId"])
      .secondaryIndexes((index) => [index("value").sortKeys(["owner"])])
      .authorization((allow) => [allow.owner(), allow.guest()]),
  })
  .authorization((access) => [access.resource(saveAndGenerateAiMessage)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "identityPool",
  },
});
