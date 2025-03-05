// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { chatId } = ctx.args;
  if (!ctx.identity || !ctx.identity.sub) {
    return util.unauthorized();
  }

  return {
    operation: "Query",
    index: "ChatId-UserId",
    expression: "chatId = :chatId, userId = :userId",
    expressionValues: util.dynamodb.toMapValues({
      chatId,
      userId: ctx.identity.sub,
    }),
    limit: 1,
  };
}

export function response(ctx) {
  ctx.stash.callerMembership = ctx.result;
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
