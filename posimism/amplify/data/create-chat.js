// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { name } = ctx.args;
  if (!ctx.identity || !ctx.identity.sub) {
    return util.unauthorized();
  }

  return {
    operation: "PutItem",
    key: {
      id: util.autoId(),
    },
    attributeValues: util.dynamodb.toMapValues({
      createdAt: util.time.nowISO8601(),
      owner: ctx.identity.sub,
      name,
    }),
  };
}

export function response(ctx) {
  return ctx.result;
}

/* type DynamoDBPutItemRequest = {
  operation: 'PutItem';
  key: { [key: string]: any };
  attributeValues: { [key: string]: any};
  condition?: ConditionCheckExpression;
  customPartitionKey?: string;
  populateIndexFields?: boolean;
  _version?: number;
};
*/
