import { util } from "@aws-appsync/utils";
import * as ddb from "@aws-appsync/utils/dynamodb";

/**
 * Verifies that the user has ownership of the AIChat
 * @param {*} ctx - The context object containing request information
 * @returns {boolean} - Whether the user is authorized to subscribe to the chat's messages
 */
export function request(ctx) {
  // If no identity is present (should not happen with proper auth setup), deny access
  if (!ctx.identity) {
    return util.unauthorized();
  }
  // Get the requesting user's identity
  const { sub } = ctx.identity;

  if (!sub) {
    return util.unauthorized();
  }

  // Get the chatID from the subscription arguments
  const { chatID } = ctx.args;

  // Query the AIChat to check if the user is the owner
  return ddb.query({
    index: "aiChatsByOwnerAndCreatedAt",
    limit: 1,
    // consistentRead: true, // unnecessary for this app
    query: {
      expression: "#owner = :owner AND chatID = :chatID",
      expressionNames: {
        "#owner": "owner",
      },
      expressionValues: {
        ":owner": sub,
        ":chatID": chatID,
      },
    },
  });
}

export const response = (ctx) => {
  if (ctx.result && ctx.result.items && ctx.result.items.length > 0) {
    return ctx.result;
  }
  return util.unauthorized();
};
