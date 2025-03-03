import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
});

// export const saveAndGenerateAiMessageSource  = backend.data.addLambdaDataSource(
//   "saveAndGenerateAiMessageSource",
//   backend.data.resources.functions.saveAndGenerateAiMessage
// );

const { cfnResources } = backend.auth.resources;
const { cfnUserPool, cfnUserPoolClient } = cfnResources;

// cfnUserPool.addPropertyOverride(
//   "Policies.SignInPolicy.AllowedFirstAuthFactors",
//   ["PASSWORD", "WEB_AUTHN", "EMAIL_OTP", "SMS_OTP"]
// );
cfnUserPool.addPropertyOverride(
  "Policies.SignInPolicy.AllowedFirstAuthFactors",
  ["PASSWORD", "WEB_AUTHN", "EMAIL_OTP"]
);

cfnUserPoolClient.explicitAuthFlows = [
  "ALLOW_USER_SRP_AUTH",
  "ALLOW_REFRESH_TOKEN_AUTH",
  "ALLOW_USER_AUTH",
];

/* Needed for WebAuthn */
cfnUserPool.addPropertyOverride("WebAuthnRelyingPartyID", "posimism.com");
cfnUserPool.addPropertyOverride("WebAuthnUserVerification", "preferred");
