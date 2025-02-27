import { saveAndGenerateMessage } from "../functions/save-and-generate-message/resource";
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a
  .schema({
    AIChat: a
      .model({
        id: a.id().required(),
        createdAt: a
          .datetime()
          .authorization((allow) => [allow.owner().to(["read"])]),
        owner: a
          .string()
          .required()
          .authorization((allow) => [allow.owner().to(["create", "read"])]),
        name: a.string(),
        messages: a.hasMany("AiChatMessage", "chatID"),
      })
      .authorization((allow) => [
        allow.owner().to(["create", "read", "update"]),
      ])
      .secondaryIndexes((index) => [index("owner").sortKeys(["createdAt"])])
      .identifier(["id"]),
    AiChatMessage: a
      .model({
        id: a.id().required(),
        createdAt: a.datetime().required(),
        chatID: a.id().required(),
        chat: a.belongsTo("AIChat", "chatID"),
        owner: a.string().required(),
        isAi: a.boolean().required(),
        msg: a.string().required(),
        streaming: a.boolean(),
        quickReplies: a.hasMany("QuickReply", "msgID"),
      })
      .identifier(["id"])
      .secondaryIndexes((index) => [index("chatID").sortKeys(["createdAt"])])
      .authorization((allow) => [allow.owner().to(["read"])]),
    createMessage: a
      .mutation()
      .arguments({
        chatID: a.id().required(),
        msg: a.string().required(),
      })
      .authorization((allow) => [allow.guest(), allow.authenticated()])
      .returns(a.ref("AiChatMessage"))
      .handler(a.handler.function(saveAndGenerateMessage).async()),
    QuickReply: a
      .model({
        msgID: a.id().required(),
        owner: a.string().required(),
        value: a.string().required(),
        msg: a.belongsTo("AiChatMessage", "msgID"),
      })
      .identifier(["msgID"])
      .secondaryIndexes((index) => [index("value").sortKeys(["owner"])])
      .authorization((allow) => [allow.owner()]),
    AIMessageStreamUpdate: a.customType({
      id: a.string().required(),
      chatID: a.string().required(),
      messageID: a.string().required(),
      index: a.integer().required(),
      delta: a.string().required(),
      isComplete: a.boolean().required(),
    }),
    updateAIMessageStream: a
      .mutation()
      .arguments({
        messageID: a.string().required(),
        delta: a.string().required(),
        index: a.integer().required(),
        isComplete: a.boolean().required(),
      })
      .returns(a.ref("AIMessageStreamUpdate")),
    onAIMessageStream: a
      .subscription()
      .for(a.ref("updateAIMessageStream"))
      .arguments({
        chatID: a.string().required(),
      })
      .handler([
        a.handler.custom({
          dataSource: a.ref("AIChat"),
          entry: "./check-user-AIChat-Ownership.js",
        }),
        a.handler.custom({
          entry: "./on-AIMessage-stream-filter.js",
        }),
      ])
      .authorization((allow) => [allow.authenticated()]),
    testIsAuthenticated: a
      .mutation()
      .arguments({})
      .handler(
        a.handler.custom({
          entry: "./has-sub.js",
        })
      )
      .returns(a.boolean())
      .authorization((allow) => [allow.authenticated()]),
  })
  .authorization((access) => [access.resource(saveAndGenerateMessage)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "identityPool",
  },
});
