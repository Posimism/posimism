import { util } from "@aws-appsync/utils";

export function request() {
  return { payload: null };
}

export function response(ctx) {
  const { owners } = ctx.stash;
  if (!owners || owners.length === 0) {
    return util.unauthorized();
  }
  if (owners.some((owner) => owner != owners[0])) {
    return util.unauthorized();
  }
  if (
    owners[0] !== ctx.identity.sub &&
    owners[0] !== ctx.identity.cognitoIdentityId
  ) {
    return util.unauthorized();
  }
  return ctx.prev.result;
}
