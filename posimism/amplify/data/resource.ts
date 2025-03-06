import { authCreateConfirmation } from "../functions/authCreateConfirmation/resource";
import { saveAndGenerateAiMessage } from "../functions/save-and-generate-AiMessage/resource";
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { AIChat } from "./AIChat/Models";
import { Chat } from "./Chat/Chat/Models";
import { ChatTypes } from "./Chat/Types";
import { chatMethods } from "./Chat/Chat/Custom";
import { ChatMember } from "./Chat/ChatMember/Models";
import { Message } from "./Chat/Message/Models";
import { messageMethods } from "./Chat/Message/Custom";
import { User } from "./User/Models";
import { userMethods } from "./User/Custom";
import { chatMemberMethods } from "./Chat/ChatMember/Custom";

const schema = a
  .schema({
    ...AIChat,
    ...ChatTypes,
    ...Chat,
    ...chatMethods,
    ...ChatMember,
    ...chatMemberMethods,
    ...Message,
    ...messageMethods,
    ...User,
    ...userMethods,
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
