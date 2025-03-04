// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { chatId } = ctx.args;
  if (!identity.sub) {
    return util.unauthorized();
  }

  return {
    operation: "Query",
    index: "ChatMembersByChatIdAndUserId",
    expression: "chatId = :chatId, userId = :userId",
    expressionValues: util.dynamodb.toMapValues({
      chatId,
      userId: ctx.identity.sub,
    }),
    limit: 1,
  };
}

export function repsponse(ctx) {
  ctx.stash.callerMembership = ctx.result
  return ctx.result;
}

/* type DynamoDBQueryRequest = {
  operation: 'Query';
  query: {
    expression: string;
    expressionNames?: { [key: string]: string };
    expressionValues?: { [key: string]: any };
  };
  index?: string;
  nextToken?: string;
  limit?: number;
  scanIndexForward?: boolean;
  consistentRead?: boolean;
  select?: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES';
  filter?: {
    expression: string;
    expressionNames?: { [key: string]: string };
    expressionValues?: { [key: string]: any };
  };
  projection?: {
    expression: string;
    expressionNames?: { [key: string]: string };
  };
}; */
