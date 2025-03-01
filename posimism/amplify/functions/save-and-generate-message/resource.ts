import { defineFunction } from "@aws-amplify/backend";

export const saveAndGenerateMessage = defineFunction({
  timeoutSeconds: 180,
  environment: {},
});

export default saveAndGenerateMessage;
