import { defineFunction, } from "@aws-amplify/backend";

export const saveAndGenerateMessage = defineFunction({
  memoryMB: 128,
  timeoutSeconds: 20,
  environment: { },
});
