import { defineFunction, secret, } from "@aws-amplify/backend";

export const saveAndGenerateAiMessage = defineFunction({
  memoryMB: 128,
  timeoutSeconds: 180,
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
  },
});
