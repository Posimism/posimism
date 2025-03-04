// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { chatId, stash } = ctx.args;
  if (!identity.sub || !stash.callerMembership) {
    return util.unauthorized();
  }

  return {
    operation: "Query",
    index: "ChatId-CreatedAt",
    expression: "chatId = :chatId",
    expressionValues: util.dynamodb.toMapValues({
      chatId,
    }), 
    scanIndexForward: false,
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
