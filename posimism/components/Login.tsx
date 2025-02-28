// components/Login.tsx
"use client";

import { withAuthenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';
import { AuthUser } from "aws-amplify/auth";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function Login({ user }: { user?: AuthUser }) {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';
  
  useEffect(() => {
    if (user) {
      // Redirect to the original page or fallback to home
      redirect(returnTo);
    }
  }, [user, returnTo]);
  
  return null;
}

export default withAuthenticator(Login);