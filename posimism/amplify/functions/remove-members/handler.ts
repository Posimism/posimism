import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/save-and-generate-message";

// Get configuration and set up clients
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

export const handler: Schema["removeMembers"]["functionHandler"] = async (
  event
) => {
  const {
    arguments: { chatId, members },
  } = event;
  const identity = event.identity;

  // make sure authenticated then use userPool
  const userID = identity && "sub" in identity && identity.sub;

  // Validate user authentication
  if (!userID) {
    throw new Error("Unauthorized");
  }

  const membersPermsPromise = [...members, identity.sub]
    .filter((member) => member !== null)
    .map((member) =>
      client.models.ChatMember.listChatMemberByChatIdAndUserId(
        {
          chatId,
        },
        {
          filter: {
            userId: { eq: member },
          },
          limit: 1,
          authMode: "lambda",
        }
      )
    );

  const membersPermsRes = await Promise.all(membersPermsPromise);
  const callerPermRes = membersPermsRes.pop();
  if (!callerPermRes || !callerPermRes.data || !callerPermRes.data[0]) {
    throw new Error("Unauthorized");
  }
  const callerPerms = callerPermRes.data[0].perms;
  const chatMembers = membersPermsRes
    .filter((res) => res.data && res.data[0])
    .map((res) => res.data[0]);
  // Verify user is owner or can removeMembers and is not missing one of the member's perms
  if (
    !(
      callerPerms.owner ||
      (callerPerms.removeMembers &&
        !chatMembers.some(({ perms }) =>
          Object.entries(perms).some(
            ([key, value]) =>
              value &&
              !(
                key in callerPerms &&
                callerPerms[key as keyof typeof callerPerms]
              )
          )
        ))
    )
  ) {
    throw new Error("Unauthorized");
  }

  // Save user message
  const removeMembersPromises = chatMembers.map(({ id }) =>
    client.models.ChatMember.delete({ id })
  );

  await Promise.all(removeMembersPromises);
  return chatMembers;
};
