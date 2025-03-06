import { a } from "@aws-amplify/backend";

export const User = {
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
};
