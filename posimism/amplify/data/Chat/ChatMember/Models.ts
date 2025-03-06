import { a } from "@aws-amplify/backend";

export const ChatMemberType = {
  id: a.id().required(),
  chatId: a.id().required(),
  userId: a.id().required(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  perms: a.ref("ChatPermissions").required(),
};

export const ChatMember = {
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
};
