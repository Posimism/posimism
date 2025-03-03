import { util } from "@aws-appsync/utils";
import * as ddb from "@aws-appsync/utils/dynamodb";

export function request(ctx) {
  const { chatId } = ctx.args;
  return ddb.get({
    key: { id: chatId },
  });
}

export function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  if (!result) {
    return util.appendError("Chat not found", "NotFound", result);
  }
  ctx.stash.chat = result;
  ctx.stash.owner = chat.owner;
  return ctx.result;
}
