import { a } from "@aws-amplify/backend";

export const MessageType = {
  id: a.id().required(),
  owner: a.string().required(),
  createdAt: a
    .datetime()
    .required()
    .authorization((allow) => [allow.owner().to(["read"])]),
  chatId: a.id().required(),
  msg: a.string(),
  parentId: a.id(),
};

export const Message = {
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
};
