import { defineFunction, secret, } from "@aws-amplify/backend";

export const saveAndGenerateMessage = defineFunction({
  timeoutSeconds: 180,
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
  },
});
