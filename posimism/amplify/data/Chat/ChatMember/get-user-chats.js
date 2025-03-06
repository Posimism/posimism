// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

/**
 * @param {import('@aws-appsync/utils').Context} ctx
 */
export function request(ctx) {
  const { nextToken, limit } = ctx.args;
  if (!ctx.identity.sub) {
    return util.unauthorized();
  }

  return {
    operation: "Query",
    index: "UserId-ChatId",
    query: {
      expression: "userId = :userId",
      expressionValues: util.dynamodb.toMapValues({
        ":userId": ctx.identity.sub,
      }),
    },
    limit: limit,
    nextToken: nextToken,
  };
}

export function response(ctx) {
  const { items, nextToken } = ctx.result;
  return { chats: items ?? [], next: nextToken };
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
