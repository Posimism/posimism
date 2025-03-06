import { a } from "@aws-amplify/backend";

export const messageMethods = {
  getChatMessages: a
    .query()
    .arguments({
      chatId: a.id().required(),
      nextToken: a.string(), // msgId
      limit: a.integer(),
    })
    .returns(a.ref("PaginatedChatMessages"))
    .authorization((allow) => [allow.authenticated()])
    .handler([
      a.handler.custom({
        dataSource: a.ref("ChatMember"),
        entry: "../ChatMember/get-user-chat-auth.js",
      }),
      a.handler.custom({
        dataSource: a.ref("Message"),
        entry: "./get-messages.js",
      }),
    ]),
  createMessageMutation: a
    .mutation()
    .arguments({
      chatId: a.id().required(),
      msg: a.string().required(),
      parentId: a.id(),
    })
    .returns(a.ref("Message"))
    .authorization((allow) => [allow.authenticated()])
    .handler([
      a.handler.custom({
        dataSource: a.ref("ChatMember"),
        entry: "../ChatMember/get-user-chat-auth.js",
      }),
      a.handler.custom({
        dataSource: a.ref("Message"),
        entry: "./get-message.js",
      }),
      a.handler.custom({
        dataSource: a.ref("Message"),
        entry: "./create-message.js",
      }),
    ]),
  /*     deleteOwnMessage: a
  .mutation()
  .arguments({
    MsgId: a.id().required(),
  })
  .returns(a.ref("Message"))
  .handler([
    a.handler.custom({
      dataSource: a.ref("Message"),
      entry: "./delete-message",
    }),
  ]), */
  /*     deleteAnyMessage: a
  .mutation()
  .arguments({
    ChatId: a.id().required(),
    MsgId: a.id().required(),
  })
  .returns(a.ref("Message"))
  .handler([
    a.handler.custom({
      dataSource: a.ref("ChatMember"),
      entry: "./get-user-chat-auth",
    }),
    a.handler.custom({
      dataSource: a.ref("Message"),
      entry: "./delete-message",
    }),
  ]), */
  /* editMessage: a
  .mutation()
  .arguments({
    MsgId: a.id().required(),
    msg: a.string().required(),
  })
  .returns(a.ref("Message"))
  .handler([
    a.handler.custom({j
      dataSource: a.ref("Message"),
      entry: "./edit-message",
    }),
  ]), */
  subscribeToChatMessages: a
    .subscription()
    .arguments({
      chatId: a.id().required(),
    })
    .for([
      a.ref("createMessageMutation"),
      // a.ref("deleteOwnMessage"),
      // a.ref("deleteAnyMessage"),
      // a.ref("editMessage"),
    ])
    .authorization((allow) => [allow.authenticated()])
    .handler([
      a.handler.custom({
        dataSource: a.ref("ChatMember"),
        entry: "../ChatMember/get-user-chat-auth.js",
      }),
      a.handler.custom({
        entry: "./chat-messages-filter.js", //TODO
      }),
    ]),
};
