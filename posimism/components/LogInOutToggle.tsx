"use client";
import Link from "next/link";
import { useUserID } from "@/utils/amplify-utils-client";
import { signOut } from "aws-amplify/auth";
import { Button } from "./ui/button_shad_default";

export const LogInOutToggle = () => {
  const { isAuthenticated } = useUserID();

  return isAuthenticated ? (
    <Button variant={"default"} onClick={() => signOut()}>
      Sign out
    </Button>
  ) : (
    <Button variant={"default"}>
      <Link className="" href="/login">
        Sign in
      </Link>
    </Button>
  );
};
