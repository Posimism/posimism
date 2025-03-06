// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

/**
 * @param {import('@aws-appsync/utils').Context} ctx
 */
export function request(ctx) {
  const { chatId } = ctx.args;
  if (!ctx.identity?.sub) {
    return util.unauthorized();
  }

  return {
    operation: "Query",
    index: "ChatId-UserId",
    query: {
      expression: "chatId = :chatId AND userId = :userId",
      expressionValues: util.dynamodb.toMapValues({
        ":chatId": chatId,
        ":userId": ctx.identity.sub,
      }),
    },
    limit: 1,
  };
}

export function response(ctx) {
  ctx.stash.callerMembership = ctx.result?.items?.[0];
  return ctx.stash.callerMembership;
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
