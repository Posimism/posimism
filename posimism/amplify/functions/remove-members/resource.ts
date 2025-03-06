import { defineFunction, } from "@aws-amplify/backend";

export const removeMembers = defineFunction({
  memoryMB: 128,
  timeoutSeconds: 20,
  environment: { },
});
