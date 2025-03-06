// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

/**
 * @param {import('@aws-appsync/utils').Context} ctx
 */
export function request(ctx) {
  const { sub } = ctx.args;
  if (!ctx.identity?.sub) {
    return util.unauthorized();
  }

  return {
    operation: "GetItem",
    key: {
      sub,
    },
  };
}

export function response(ctx) {
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
