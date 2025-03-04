import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a
  .schema({
    Chat: a
      .model({
        id: a.id().required(),
        createdAt: a.datetime(),
        owner: a.string().required(),
        name: a.string(),
        members: a.hasMany("ChatMember", "chatId"),
        messages: a.hasMany("Message", "chatId"),
      })
      .identifier(["id"])
      .secondaryIndexes((index) => [index("owner").sortKeys(["createdAt"])])
      .authorization((allow) => [allow.owner().to(["read"])]),
    ChatIdentifer: a.customType({
      id: a.id().required(),
    }),
    createChat: a
      .mutation()
      .arguments({
        name: a.string(),
        members: a.string().array(),
      })
      .returns(a.ref("Chat")),
    deleteChat: a
      .mutation()
      .arguments({
        id: a.id().required(),
      })
      .handler(a.handler.function("./delete-chat.ts")) // too much data for custom resolvers
      // auth handled by lambda resolver
      .returns(a.ref("Chat")),
    ChatPermissions: a.customType({
      owner: a.boolean(),
      post: a.boolean(),
      updateChat: a.boolean(),
      addMembers: a.boolean(),
      listMembers: a.boolean(),
      removeMembers: a.boolean(),
      deleteOwnChat: a.boolean(),
      deleteAnyChat: a.boolean(),
    }),
    ChatMember: a
      .model({
        id: a.id().required(),
        chatId: a.id().required(),
        userId: a.id().required(),
        createdAt: a.datetime(),
        updatedAt: a.timestamp(),
        chat: a.belongsTo("Chat", "chatId"),
        user: a.belongsTo("User", "userId"),
        perms: a.ref("ChatPermissions").required(),
      })
      .authorization(() => [])
      .secondaryIndexes((index) => [
        index("chatId").sortKeys(["userId"]),
        index("userId").sortKeys(["chatId"]),
      ])
      .identifier(["id"]),
    getChatMembers: a
      .mutation()
      .arguments({
        chatId: a.id().required(),
        after: a.id(),
        limit: a.integer(),
      })
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth.js",
        }),
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-members.js",
        }),
      ])
      .returns(a.ref("ChatMember").array()),
    addMember: a // Add or overwrite membershipo
      .mutation()
      .arguments({
        chatId: a.id().required(),
        member: a.string().required(),
        perms: a.ref("ChatPermissions"),
      })
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./add-member.js",
        }),
      ])
      .returns(a.ref("ChatMember")),
    addMembers: a
      .mutation()
      .arguments({
        chatId: a.id().required(),
        members: a.string().array().required(),
        perms: a.ref("ChatPermissions").array().required(),
      })
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./add-members",
        }),
      ])
      .returns(a.ref("ChatMember").array()),
    removeMembers: a
      .mutation()
      .arguments({
        chatId: a.id().required(),
        members: a.string().array().required(),
      })
      .handler(a.handler.function("./remove-members.ts"))
      .returns(a.ref("ChatMember")),
    getUserChats: a
      .query()
      .arguments({
        after: a.ref("ChatIdentifier"),
        limit: a.integer(),
      })
      .returns(a.ref("Chat").array())
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chats",
        }),
      ]),
    typingStatus: a.customType({
      chatId: a.id().required(),
      userId: a.id().required(),
      isTyping: a.boolean().required(),
    }),
    setIsTyping: a
      .mutation()
      .arguments({
        chatId: a.id().required(),
        isTyping: a.boolean().required(),
      })
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("NONE"),
          entry: "./set-is-typing",
        }),
      ])
      .returns(a.ref("typingStatus")),
    isTypingChatSubscription: a
      .subscription()
      .arguments({
        chatId: a.id().required(),
      })
      .for(a.ref("setIsTyping"))
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("NONE"),
          entry: "./is-typing-filter",
        }),
      ]),
    User: a
      .model({
        sub: a.id().required(),
        username: a.string().required(),
        email: a
          .string()
          .required()
          .authorization((allow) => [allow.owner().to(["read"])]),
        chats: a.hasMany("ChatMember", "userId").authorization(() => []),
      })
      .identifier(["sub"]),
    // If lazy loading replies, extract message type and create another replies model (like quickReplies)
    Message: a
      .model({
        id: a.id().required(),
        owner: a.string().required(),
        createdAt: a
          .timestamp()
          .authorization((allow) => [allow.owner().to(["read"])]),
        chatId: a.id().required(),
        chat: a.belongsTo("Chat", "chatId"),
        msg: a.string(),
        editedAt: a.timestamp(),
        parentId: a.id(),
        parent: a.belongsTo("Message", "parentId"),
        replies: a.hasMany("Message", "parentId"),
        quickReplies: a.hasMany("QuickReply", "msgId"),
        status: a.hasMany("MessageStatus", "msgId"),
      })
      .identifier(["id"])
      .secondaryIndexes((index) => [index("chatId").sortKeys(["createdAt"])])
      .authorization((allow) => [allow.owner()]),
    MessageIdentifier: a.customType({
      id: a.id().required(),
    }),
    getChatMessages: a
      .query()
      .arguments({
        chatId: a.id().required(),
        after: a.id(), // msgId
        limit: a.integer(),
      })
      .returns(a.ref("Message").array())
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("Message"),
          entry: "./get-messages",
        }),
      ]),
    createMessage: a
      .mutation()
      .arguments({
        chatId: a.id().required(),
        msg: a.string().required(),
        parentId: a.id(),
      })
      .returns(a.ref("Message"))
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("Message"),
          entry: "./create-message",
        }),
      ]),
    deleteOwnMessage: a
      .mutation()
      .arguments({
        Id: a.ref("MessageIdentifier").required(),
      })
      .returns(a.ref("Message"))
      .handler([
        a.handler.custom({
          dataSource: a.ref("Message"),
          entry: "./delete-message",
        }),
      ]),
    deleteAnyMessage: a
      .mutation()
      .arguments({
        ChatId: a.id().required(),
        Id: a.ref("MessageIdentifier").required(),
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
      ]),
    editMessage: a
      .mutation()
      .arguments({
        Id: a.ref("MessageIdentifier").required(),
        msg: a.string().required(),
      })
      .returns(a.ref("Message"))
      .handler([
        a.handler.custom({
          dataSource: a.ref("Message"),
          entry: "./edit-message",
        }),
      ]),
    subscribeToChatMessages: a
      .subscription()
      .for([
        a.ref("createMessage"),
        a.ref("deleteOwnMessage"),
        a.ref("deleteAnyMessage"),
        a.ref("editMessage"),
      ])
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("NONE"),
          entry: "./chat-messages-filter",
        }),
      ]),
    QuickReply: a
      .model({
        msgId: a.id().required(),
        owner: a.string().required(),
        value: a.string().required(),
        chatId: a.id().required(),
        chat: a.belongsTo("Chat", "chatId"),
        msg: a.belongsTo("Message", "msgId"),
      })
      .identifier(["msgId", "owner"])
      .authorization((allow) => [allow.owner().to(["read"])]), // use custom mutations for subscription simplicity
    upsertQuickReply: a
      .mutation()
      .arguments({
        msgId: a.id().required(),
        value: a.string().required(),
      })
      .returns(a.ref("QuickReply"))
      .handler([
        a.handler.custom({
          dataSource: a.ref("Message"),
          entry: "./get-message-chat",
        }),
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("QuickReply"),
          entry: "./upsert-quick-reply",
        }),
      ]),
    deleteQuickReply: a
      .mutation()
      .arguments({
        msgId: a.id().required(),
      })
      .returns(a.ref("QuickReply"))
      .handler([
        a.handler.custom({
          dataSource: a.ref("QuickReply"),
          entry: "./delete-quick-reply",
        }),
      ]),
    subscribeToQuickReplies: a
      .subscription()
      .arguments({
        chatId: a.id().required(),
      })
      .for([a.ref("upsertQuickReply"), a.ref("deleteQuickReply")])
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("NONE"),
          entry: "./quick-replies-filter",
        }),
      ]),
    ConfirmationStatus: a.customType({
      value: a.enum(["sent", "delivered", "read"]),
    }),
    MessageStatusIdentifier: a.customType({
      msgId: a.id().required(),
      owner: a.id().required(),
    }),
    MessageStatus: a
      .model({
        msgId: a.id().required(),
        owner: a.id().required(),
        status: a.ref("MessageStatus").required(),
        message: a.belongsTo("Message", "msgId"),
        user: a.belongsTo("User", "owner"),
        chat: a.belongsTo("Chat", "chatId"),
      })
      // .secondaryIndexes((index) => [index("msgId").sortKeys(["userId"])])
      .authorization((allow) => [allow.owner().to(["read"])])
      .identifier(["msgId", "owner"]),
    updateChatStatus: a // Updates statuses for all non-read messages
      .mutation()
      .arguments({
        msgId: a.id().required(),
        status: a.ref("MessageStatus").required(),
      })
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("MessageStatus"),
          entry: "./set-messages-status",
        }),
      ])
      .returns(a.ref("MessageStatus").array()),
    subscribeToChatMessageStatuses: a
      .subscription()
      .arguments({
        chatId: a.id().required(),
      })
      .for(a.ref("updateChatStatus"))
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("NONE"),
          entry: "./message-status-filter",
        }),
      ]),
  })
  .authorization((allow) => [allow.authenticated()]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "identityPool",
    // lambdaAuthorizationMode: {
    //   function: defineFunction({
    //     entry: "./chat-authorizer.ts",
    //     memoryMB: 128,
    //   }),
    // },
  },
});
