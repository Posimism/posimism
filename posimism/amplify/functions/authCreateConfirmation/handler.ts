import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/save-and-generate-message";

// Get configuration and set up clients
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  await client.models.User.create({
    sub: event.request.userAttributes.sub,
    email: event.request.userAttributes.email,
    username: event.request.userAttributes.username,
  });
  
  return event;
};
