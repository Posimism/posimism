import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a
  .schema({
    Chat: a
      .model({
        id: a.id().required(),
        createdAt: a.datetime(),
        owner: a.string().required(),
        name: a.string(),
        members: a.hasMany("ChatMember", "chatID"),
        messages: a.hasMany("Message", "chatID"),
      })
      .identifier(["id"])
      .secondaryIndexes((index) => [index("owner").sortKeys(["createdAt"])])
      .authorization((allow) => [allow.owner().to(["read"])]),
    ChatIDentifer: a.customType({
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
        chatID: a.id().required(),
        userID: a.id().required(),
        createdAt: a.datetime(),
        updatedAt: a.timestamp(),
        chat: a.belongsTo("Chat", "chatID"),
        user: a.belongsTo("User", "userID"),
        perms: a.ref("ChatPermissions").required(),
      })
      .authorization(() => [])
      .secondaryIndexes((index) => [
        index("chatID").sortKeys(["userID"]),
        index("userID").sortKeys(["chatID"]),
      ])
      .identifier(["id"]),
    getChatMembers: a
      .mutation()
      .arguments({
        chatID: a.id().required(),
        after: a.id(),
        limit: a.integer(),
      })
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-members",
        }),
      ])
      .returns(a.ref("ChatMember").array()),
    addMember: a
      .mutation()
      .arguments({
        chatID: a.id().required(),
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
          entry: "./add-member",
        }),
      ])
      .returns(a.ref("ChatMember")),
    addMembers: a
      .mutation()
      .arguments({
        chatID: a.id().required(),
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
    removeMember: a
      .mutation()
      .arguments({
        chatID: a.id().required(),
        member: a.string(),
      })
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth",
        }),
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./remove-member",
        }),
      ])
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
      chatID: a.id().required(),
      userID: a.id().required(),
      isTyping: a.boolean().required(),
    }),
    setIsTyping: a
      .mutation()
      .arguments({
        chatID: a.id().required(),
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
        chatID: a.id().required(),
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
        chats: a.hasMany("ChatMember", "userID").authorization(() => []),
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
        chatID: a.id().required(),
        chat: a.belongsTo("Chat", "chatID"),
        msg: a.string(),
        editedAt: a.timestamp(),
        parentID: a.id(),
        parent: a.belongsTo("Message", "parentID"),
        replies: a.hasMany("Message", "parentID"),
        quickReplies: a.hasMany("QuickReply", "msgID"),
        status: a.hasMany("MessageStatus", "msgID"),
      })
      .identifier(["id"])
      .secondaryIndexes((index) => [index("chatID").sortKeys(["createdAt"])])
      .authorization((allow) => [allow.owner()]),
    MessageIDentifier: a.customType({
      id: a.id().required(),
    }),
    getChatMessages: a
      .query()
      .arguments({
        chatID: a.id().required(),
        after: a.id(), // msgID
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
        chatID: a.id().required(),
        msg: a.string().required(),
        parentID: a.id(),
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
        ID: a.ref("MessageIDentifier").required(),
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
        ChatID: a.id().required(),
        ID: a.ref("MessageIDentifier").required(),
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
        ID: a.ref("MessageIDentifier").required(),
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
        msgID: a.id().required(),
        owner: a.string().required(),
        value: a.string().required(),
        chatID: a.id().required(),
        chat: a.belongsTo("Chat", "chatID"),
        msg: a.belongsTo("Message", "msgID"),
      })
      .identifier(["msgID", "owner"])
      .authorization((allow) => [allow.owner().to(["read"])]), // use custom mutations for subscription simplicity
    upsertQuickReply: a
      .mutation()
      .arguments({
        msgID: a.id().required(),
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
        msgID: a.id().required(),
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
        chatID: a.id().required(),
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
    MessageStatusIDentifier: a.customType({
      msgID: a.id().required(),
      owner: a.id().required(),
    }),
    MessageStatus: a
      .model({
        msgID: a.id().required(),
        owner: a.id().required(),
        status: a.ref("MessageStatus").required(),
        message: a.belongsTo("Message", "msgID"),
        user: a.belongsTo("User", "owner"),
        chat: a.belongsTo("Chat", "chatID"),
      })
      // .secondaryIndexes((index) => [index("msgID").sortKeys(["userID"])])
      .authorization((allow) => [allow.owner().to(["read"])])
      .identifier(["msgID", "owner"]),
    updateChatStatus: a // Updates statuses for all non-read messages
      .mutation()
      .arguments({
        msgID: a.id().required(),
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
        chatID: a.id().required(),
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
