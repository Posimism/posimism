import { a } from "@aws-amplify/backend";

export const ChatTypes = {
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
};
