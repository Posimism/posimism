import { defineFunction, } from "@aws-amplify/backend";

export const authCreateConfirmation = defineFunction({
  memoryMB: 128,
  timeoutSeconds: 20,
  environment: { },
});
