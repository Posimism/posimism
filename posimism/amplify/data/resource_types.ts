import { a } from "@aws-amplify/backend";

export const ChatType = {
  id: a.id().required(),
  createdAt: a.datetime(),
  owner: a.string().required(),
  name: a.string(),
};

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

export const ChatMemberType = {
  id: a.id().required(),
  chatId: a.id().required(),
  userId: a.id().required(),
  createdAt: a.datetime(),
  updatedAt: a.timestamp(),
  perms: a.ref("ChatPermissions").required(),
};
