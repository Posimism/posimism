// import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

/**
 * @param {import('@aws-appsync/utils').Context} ctx
 */
export function request(ctx) {
  const { chatId, msg, parentId } = ctx.args;
  const stash = ctx.stash;
  if (!ctx.identity.sub || !stash.callerMembership) {
    return util.unauthorized();
  }
  if (parentId && !stash.retrievedMessage) {
    return util.error(
      "Parent message not found",
      "NotFoundError",
      { parentId: ctx.args.parentId },
      { additionalInfo: "The specified parent message ID does not exist" }
    );
  }

  return {
    operation: "PutItem",
    key: {
      id: util.autoId(),
    },
    attributeValues: util.dynamodb.toMapValues({
      owner: ctx.identity.sub,
      createdAt: util.time.nowISO8601(),
      chatId,
      msg,
      parentId,
    }),
    condition: util.transform.toDynamoDBConditionExpression({
      id: {
        attributeExists: false,
      },
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
