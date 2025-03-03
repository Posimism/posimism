import { defineFunction, secret } from "@aws-amplify/backend";

export const AiChatListener = defineFunction({
  memoryMB: 128,
  timeoutSeconds: 180,
  resourceGroupName: "data",
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
    XAI_API_KEY: secret("XAI_API_KEY"),
    ANTHROPIC_API_KEY: secret("ANTHROPIC_API_KEY"),
  },
});
