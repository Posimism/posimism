// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { chatId, prev, after, limit } = ctx.args;

  if (!prev.result) {
    return util.unauthorized();
  }
  const { perms } = prev.result;
  if (!perms || (!perms.owner && !perms.listMembers)) {
    return util.unauthorized();
  }

  return {
    operation: "Query",
    index: "gsi-ChatMembers.chatId",
    query: {
      expression: "chatId = :chatId",
      expressionValues: util.dynamodb.toMapValues({ chatId }),
    },
    limit: limit ?? undefined,
    nextToken: after ?? undefined,
  };
}

export function response(ctx) {
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
