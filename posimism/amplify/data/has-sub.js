import { util } from "@aws-appsync/utils";

export function request(ctx) {
  // simplfy return null for the payload
  return { payload: null };
}

export function response(ctx) {
  if (!ctx.identity || !ctx.identity.sub) {
    return util.unauthorized();
  }
  return true;
}
