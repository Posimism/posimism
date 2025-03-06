import { a } from "@aws-amplify/backend";
import { removeMembers } from "../../../functions/remove-members/resource";

export const chatMemberMethods = {
  createChatMutation: a
    .mutation()
    .arguments({
      name: a.string(),
    })
    .handler([
      a.handler.custom({
        dataSource: a.ref("Chat"),
        entry: "../Chat/create-chat.js",
      }),
      a.handler.custom({
        dataSource: a.ref("ChatMember"),
        entry: "../ChatMember/add-member.js",
      }),
    ])
    .authorization((allow) => [allow.authenticated()])
    .returns(a.ref("ChatMember")),
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
    .handler(a.handler.function(removeMembers))
    .returns(a.ref("ChatMember").array()),
  getUserChats: a
    .query()
    .arguments({
      nextToken: a.string(),
      limit: a.integer(),
      ascending: a.boolean(),
    })
    .authorization((allow) => [allow.authenticated()])
    .returns(a.ref("PaginatedChatMembers"))
    .handler([
      a.handler.custom({
        dataSource: a.ref("ChatMember"),
        entry: "./get-user-chats.js",
      }),
      // TODO add the chats' last sent message
    ]),
};
