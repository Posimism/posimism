import { authCreateConfirmation } from "../functions/authCreateConfirmation/resource";
import { saveAndGenerateAiMessage } from "../functions/save-and-generate-Aimessage/resource";
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a
  .schema({
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
        messages: a.hasMany("AiChatMessage", "chatID"),
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
        chatID: a.id().required(),
        chat: a.belongsTo("AIChat", "chatID"),
        owner: a.string().required(),
        isAi: a.boolean().required(),
        msg: a.string().required(),
        streaming: a.boolean(),
        quickReplies: a.hasMany("QuickReply", "msgId"),
      })
      .identifier(["id"])
      .secondaryIndexes((index) => [index("chatID").sortKeys(["createdAt"])])
      .authorization((allow) => [
        allow.owner().to(["read"]),
        allow.guest().to(["read"]),
      ]),
    CreateAiMessage: a
      .mutation()
      .arguments({
        chatID: a.id().required(),
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
      // view: a.boolean(), // assumed if you any entry
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
        index("chatId").sortKeys(["userId"]).name("ChatId-UserId"),
        index("userId").sortKeys(["chatId"]).name("UserId-ChatId"),
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
          entry: "./get-user-chat-auth.js",
        }),
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./add-member.js",
        }),
      ])
      .returns(a.ref("ChatMember")),
    // addMembers: a
    //   .mutation()
    //   .arguments({
    //     chatId: a.id().required(),
    //     members: a.string().array().required(),
    //     perms: a.ref("ChatPermissions").array().required(),
    //   })
    //   .handler([
    //     a.handler.custom({
    //       dataSource: a.ref("ChatMember"),
    //       entry: "./get-user-chat-auth.js",
    //     }),
    //     a.handler.custom({
    //       dataSource: a.ref("ChatMember"),
    //       entry: "./add-members.js",
    //     }),
    //   ])
    //   .returns(a.ref("ChatMember").array()),
    removeMembers: a
      .mutation()
      .arguments({
        chatId: a.id().required(),
        members: a.string().array().required(),
      })
      .handler(a.handler.function("./remove-members.ts"))
      .returns(a.ref("ChatMember").array()),
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
    /*
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
  */
    User: a
      .model({
        sub: a.id().required(),
        username: a.string().required(),
        email: a
          .string()
          .required()
          .authorization((allow) => [allow.ownerDefinedIn("sub").to(["read"])]),
        photoKey: a
          .string()
          .authorization((allow) => [allow.ownerDefinedIn("sub").to(["read"])]),
        chats: a.hasMany("ChatMember", "userId").authorization(() => []),
      })
      .identifier(["sub"])
      .authorization((allow) => [
        allow.guest().to(["read"]),
        allow.authenticated().to(["read"]),
        allow.ownerDefinedIn("sub").to(["read", "update"]),
      ]),
    //TODO keep auth and this in sync
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
        parentId: a.id(),
        parent: a.belongsTo("Message", "parentId"),
        replies: a.hasMany("Message", "parentId"),
        quickReplies: a.hasMany("QuickReply", "msgId"),
        status: a.hasMany("MessageStatus", "msgId"),
      })
      .identifier(["id"])
      .secondaryIndexes((index) => [
        index("chatId").sortKeys(["createdAt"]).name("ChatId-CreatedAt"),
      ])
      .authorization((allow) => [allow.owner().to(["read"])]),
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
          entry: "./get-user-chat-auth.js",
        }),
        a.handler.custom({
          dataSource: a.ref("Message"),
          entry: "./get-messages.js",
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
          entry: "./get-user-chat-auth.js",
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
      .for([
        a.ref("createMessage"),
        // a.ref("deleteOwnMessage"),
        // a.ref("deleteAnyMessage"),
        // a.ref("editMessage"),
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
  /*
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
      ]), */
  })
  .authorization((access) => [
    access.resource(saveAndGenerateAiMessage),
    access.resource(authCreateConfirmation),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "identityPool",
  },
});
