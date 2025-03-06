import { a } from "@aws-amplify/backend";

export const ChatType = {
  id: a.id().required(),
  createdAt: a.datetime(),
  owner: a.string().required(),
  name: a.string(),
};

export const Chat = {
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
  ChatType: a.customType(ChatType),
  ChatIdentifer: a.customType({
    id: a.id().required(),
  }),
  PaginatedUserChats: a.customType({
    chats: a.ref("ChatType").array().required(),
    nextToken: a.string(),
  }),
};

