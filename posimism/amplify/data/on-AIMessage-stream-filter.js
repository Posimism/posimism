import { util, extensions } from "@aws-appsync/utils";

export function request(ctx) {
  // simplfy return null for the payload
  return { payload: null };
}

export function response(ctx) {
  const { chatID } = ctx.args;
  const filter = {
    chatID: { eq: chatID },
  };
  extensions.setSubscriptionFilter(util.transform.toSubscriptionFilter(filter));

  // important: return null in the response
  return null;
}
