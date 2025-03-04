import {defineStorage} from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "posimism1",
  versioned: true,
  access: (allow) => ({
      "profile-pictures/{entity_id}/*": [
        allow.guest.to(["read"]),
        allow.authenticated.to(["read"]),
        allow.entity("identity").to(["read", "write", "delete"])
      ]
  })
});