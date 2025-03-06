import { util, extensions } from "@aws-appsync/utils";

// Subscription handlers must return a `null` payload on the request
export function request() {
  return { payload: null };
}

/**
 * @param {import('@aws-appsync/utils').Context} ctx
 */
export function response(ctx) {
  const { chatId } = ctx.args;
  const stash = ctx.stash;
  if (!stash.callerMembership?.result || !ctx.identity?.sub) {
    return util.unauthorized();
  }

  const filter = {
    chatId: {
      eq: chatId,
    },
  };

  extensions.setSubscriptionFilter(util.transform.toSubscriptionFilter(filter));

  return null;
}
