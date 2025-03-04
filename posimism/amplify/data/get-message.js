// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const {msgId, parentId, stash } = ctx.args;
  if (!identity.sub || !stash.callerMembership) {
    return util.unauthorized();
  }

  if (!msgId || !parentId) {
    return { payload: null };
  }

  return {
    operation: "GetItem",
    key: {
      id: msgId ?? parentId,
    },
  };
}

export function response(ctx) {
  ctx.stash.retrievedMessage = ctx.result;
  return ctx.result;
}

/*
type DynamoDBGetItem = {
  operation: 'GetItem';
  key: { [key: string]: any };
  consistentRead?: ConsistentRead;
  projection?: {
    expression: string;
    expressionNames?: { [key: string]: string };
  };
};
*/
