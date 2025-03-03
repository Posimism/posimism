import { util } from "@aws-appsync/utils";
import * as ddb from "@aws-appsync/utils/dynamodb";

export function request(ctx) {
  const { chatIds } = ctx.args;
  if (!chatIds || chatIds.length === 0) {
    return util.appendError("No chatIds provided", "BadRequest", {});
  }
  if (chatIds.length > 100) {
    return util.appendError("Too many chatIds provided", "BadRequest", {});
  }
  return {
    operation: "BatchGetItem",
    tables: {
      AiChat: {
        keys: chatIds.map((chatId) => ({ id: chatId })),
      },
    },
  };
}

export function response(ctx) {
  const { unprocessedKeys, data } = ctx.result;
  if (Object.keys(unprocessedKeys) > 0) {
    return util.appendError(error.message, error.type, result);
  }
  if (data.AiChat.some((chat) => !chat)) {
    return util.appendError("Some chats not found", "NotFound", {});
  }
  ctx.stash.chats = data.AiChat;
  ctx.stash.owners = chats.map((chat) => chat.owner);
  return ctx.result;
}
