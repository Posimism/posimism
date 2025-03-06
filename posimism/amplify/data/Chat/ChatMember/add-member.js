// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

/**
 * @param {import('@aws-appsync/utils').Context} ctx
 */
export function request(ctx) {
  const { chatId, member, perms: permsToAdd } = ctx.args;
  if (!ctx.prev.result) {
    return util.unauthorized();
  }

  /*
    perms has addMember and nothing they don't already have
  */
  const { perms: userPerms } = ctx.prev.result;
  if (
    !userPerms ||
    (!userPerms.owner && !userPerms.addMembers) ||
    permsToAdd.some((p) => !userPerms[p])
  ) {
    return util.unauthorized();
  }

  return {
    operation: "PutItem",
    key: {
      id: util.autoId(),
    },
    attributeValues: util.dynamodb.toMapValues({
      chatId,
      userId: member,
      createdAt: util.time.nowISO8601(),
      perms: permsToAdd,
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
