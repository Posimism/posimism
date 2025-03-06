import { a } from "@aws-amplify/backend";

export const userMethods = {
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
};
