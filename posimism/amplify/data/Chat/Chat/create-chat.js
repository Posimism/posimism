// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

/**
 * @param {import('@aws-appsync/utils').Context} ctx
 */
export function request(ctx) {
  const { name } = ctx.args;
  if (!ctx.identity?.sub) {
    return util.unauthorized();
  }

  const now = util.time.nowISO8601();
  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({ id: util.autoId() }),
    attributeValues: util.dynamodb.toMapValues({
      createdAt: now,
      updatedAt: now,
      owner: ctx.identity.sub,
      name,
    }),
  };
}

export function response(ctx) {
  ctx.stash.newChat = ctx.result;
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
