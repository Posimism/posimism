import { defineFunction } from "@aws-amplify/backend";

export const saveAndGenerateMessage = defineFunction({
  entry: "handler.ts",
});
