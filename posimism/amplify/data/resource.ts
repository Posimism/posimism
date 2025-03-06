import { authCreateConfirmation } from "../functions/authCreateConfirmation/resource";
import { saveAndGenerateAiMessage } from "../functions/save-and-generate-AiMessage/resource";
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { ChatMemberType, ChatType, MessageType } from "./resource_types";

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
    Chat: a
      .model({
        ...ChatType,
        members: a.hasMany("ChatMember", "chatId"),
        messages: a.hasMany("Message", "chatId"),
        // Add lastMessage for sorting
      })
      .identifier(["id"])
      .secondaryIndexes((index) => [index("owner").sortKeys(["createdAt"])])
      .authorization((allow) => [allow.owner().to(["read"])]),
    ChatIdentifer: a.customType({
      id: a.id().required(),
    }),
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
        ...ChatMemberType,
        chat: a.belongsTo("Chat", "chatId"),
        user: a.belongsTo("User", "userId"),
        // Figure out whether I can use the generated indexes rather than the .secondaryIndexes indexes
      })
      .authorization((allow) => [allow.ownerDefinedIn("userId").to(["read"])])
      .secondaryIndexes((index) => [
        index("chatId").sortKeys(["userId"]).name("ChatId-UserId"),
        index("userId").sortKeys(["chatId"]).name("UserId-ChatId"),
      ])
      .identifier(["id"]),
    BaseChatMember: a.customType(ChatMemberType),
    PaginatedChatMembers: a.customType({
      members: a.ref("BaseChatMember").array().required(),
      nextToken: a.string(),
    }),
    getChatMembers: a
      .mutation()
      .arguments({
        chatId: a.id().required(),
        nextToken: a.string(),
        limit: a.integer(),
      })
      .returns(a.ref("PaginatedChatMembers"))
      .authorization((allow) => [allow.authenticated()])
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth.js",
        }),
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-members.js",
        }),
      ]),
    addMember: a // Add or overwrite membershipo
      .mutation()
      .arguments({
        chatId: a.id().required(),
        member: a.string().required(),
        perms: a.ref("ChatPermissions"),
      })
      .authorization((allow) => [allow.authenticated()])
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
    /* addMembers: a
      .mutation()
      .arguments({
        chatId: a.id().required(),
        members: a.string().array().required(),
        perms: a.ref("ChatPermissions").array().required(),
      })
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chat-auth.js",
        }),
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./add-members.js",
        }),
      ])
      .returns(a.ref("ChatMember").array()), */
    removeMembers: a
      .mutation()
      .arguments({
        chatId: a.id().required(),
        members: a.string().array().required(),
      })
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function("./remove-members.ts"))
      .returns(a.ref("ChatMember").array()),
    ChatType: a.customType(ChatType),
    PaginatedUserChats: a.customType({
      chats: a.ref("ChatType").array().required(),
      nextToken: a.string(),
    }),
    getUserChats: a
      .query()
      .arguments({
        nextToken: a.string(),
        limit: a.integer(),
        ascending: a.boolean(),
      })
      .authorization((allow) => [allow.authenticated()])
      .returns(a.ref("PaginatedUserChats"))
      .handler([
        a.handler.custom({
          dataSource: a.ref("ChatMember"),
          entry: "./get-user-chats.js",
        }),
        // TODO add the chats' last sent message
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
        allow.ownerDefinedIn("sub").to(["read", "update"]),
      ]),
    getUserQuery: a
      .query()
      .arguments({
        sub: a.id().required(),
      })
      .returns(a.ref("User"))
      .authorization((allow) => [allow.authenticated()])
      .handler([
        a.handler.custom({
          dataSource: a.ref("User"),
          entry: "./get-user.js",
        }),
      ]),
    //TODO keep auth and this in sync
    // If lazy loading replies, exptract message type and create another replies model (like quickReplies)
    Message: a
      .model({
        ...MessageType,
        chat: a.belongsTo("Chat", "chatId"),
        parent: a.belongsTo("Message", "parentId"),
        replies: a.hasMany("Message", "parentId"),
        // quickReplies: a.hasMany("QuickReply", "msgId"),
        // status: a.hasMany("MessageStatus", "msgId"),
      })
      .identifier(["id"])
      .secondaryIndexes((index) => [
        index("chatId").sortKeys(["createdAt"]).name("ChatId-CreatedAt"),
      ])
      .authorization((allow) => [allow.owner().to(["read"])]),
    BaseMessage: a.customType(MessageType),
    PaginatedChatMessages: a.customType({
      messages: a.ref("BaseMessage").array().required(),
      nextToken: a.string(),
    }),
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
          entry: "./get-user-chat-auth.js",
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
          entry: "./get-user-chat-auth.js",
        }),
        a.handler.custom({
          entry: "./chat-messages-filter.js", //TODO
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
      ]), 
    */
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
