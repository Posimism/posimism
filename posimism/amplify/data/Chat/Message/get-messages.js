// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { chatId, nextToken, limit } = ctx.args;
  const stash = ctx.stash;
  if (!ctx.identity?.sub || !stash.callerMembership) {
    return util.unauthorized();
  }

  return {
    operation: "Query",
    index: "ChatId-CreatedAt",
    query: {
      expression: "chatId = :chatId",
      expressionValues: util.dynamodb.toMapValues({
        ":chatId": chatId,
      }),
    },
    limit,
    nextToken,
    scanIndexForward: false,
  };
}

export function response(ctx) {
  const { items, nextToken } = ctx.result ?? {};
  return { messages: items ?? [], nextToken };
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

/*
{
  "data": { "getChatMessages": null },
  "errors": [
    {
      "path": ["getChatMessages"],
      "data": null,
      "errorType": "Unauthorized",
      "errorInfo": null,
      "locations": [{ "line": 2, "column": 3, "sourceName": null }],
      "message": "Not Authorized to access getChatMessages on type Query"
    }
  ]
}
 */
