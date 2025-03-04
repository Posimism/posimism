// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { chatId, member, perms: permsToAdd } = ctx.args;
  if (!prev.result) {
    return util.unauthorized();
  }

  /*
    perms has addMember and nothing they don't already have
  */
  const { perms: userPerms } = prev.result;
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
      id: util.autoId()
    },
    attributeValues: {
      chatId,
      createdAt: util.time.nowISO8601(),
      userId: member,
      perms: permsToAdd,
    },
    limit: limit ?? undefined,
    nextToken: after ?? undefined,
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