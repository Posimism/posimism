import { a } from "@aws-amplify/backend";

export const chatMethods = {
  createChatMutation: a
    .mutation()
    .arguments({
      name: a.string(),
    })
    .handler(
      a.handler.custom({
        dataSource: a.ref("Chat"),
        entry: "./create-chat.js",
      })
    )
    .authorization((allow) => [allow.authenticated()])
    .returns(a.ref("Chat")),
  // deleteChat: a
  //   .mutation()
  //   .arguments({
  //     id: a.id().required(),
  //   })
  //   .handler(a.handler.function("./delete-chat.ts")) // too much data for custom resolvers
  //   .authorization((allow) => [allow.authenticated()])
  //   // auth handled by lambda resolver
  //   .returns(a.ref("Chat")),
};
