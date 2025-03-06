// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

/**
 * @param {import('@aws-appsync/utils').Context} ctx
 */
export function request(ctx) {
  const { chatId, member, perms: permsToAdd } = ctx.args;
  const { newChat } = ctx.stash;
  if (!newChat && !ctx.prev?.result) {
    return util.unauthorized();
  }

  // newChat means we're adding the owner to a new chat
  if (newChat) {
    return {
      operation: "PutItem",
      key: util.dynamodb.toMapValues({
        id: util.autoId(),
      }),
      attributeValues: util.dynamodb.toMapValues({
        chatId: newChat.id,
        userId: newChat.owner,
        createdAt: newChat.createdAt,
        updatedAt: newChat.updatedAt,
        perms: { owner: true },
      }),
    };
  }
  // !newChat means we're adding a member to an existing chat

  /*
    caller must be owner OR (have addMembers and not be adding perms they don't have)
    AND
    they can't be adding a new owner
  */
  const { perms: userPerms } = ctx.prev.result;
  if (
    (!userPerms.owner &&
      (!userPerms.addMembers ||
        Object.entries(permsToAdd).some(
          ([perm, granted]) => granted && !userPerms[perm]
        ))) ||
    permsToAdd.owner
  ) {
    return util.unauthorized();
  }

  const now = util.time.nowISO8601();
  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({
      id: util.autoId(),
    }),
    attributeValues: util.dynamodb.toMapValues({
      chatId,
      userId: member,
      createdAt: now,
      updatedAt: now,
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
