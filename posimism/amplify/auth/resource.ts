import { defineAuth } from "@aws-amplify/backend";
import { authCreateConfirmation } from "../functions/authCreateConfirmation/resource";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  name: "posimism-1",
  loginWith: {
    email: true,
  },
  multifactor: {
    mode: "OPTIONAL",
    totp: true,
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    phoneNumber: {
      required: false,
      mutable: true,
    },
    preferredUsername: {
      mutable: true,
      required: true,
    },
  },
  triggers: {
    postConfirmation: authCreateConfirmation,
  },
});
