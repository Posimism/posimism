import { util } from "@aws-appsync/utils";

export function request() {
  return { payload: null };
}

export function response(ctx) {
  const { owner } = ctx.stash;
  if (!owner) {
    return util.unauthorized();
  }
  if (
    owner !== ctx.identity.sub &&
    owner !== ctx.identity.cognitoIdentityId
  ) {
    return util.unauthorized();
  }
  return ctx.prev.result;
}
