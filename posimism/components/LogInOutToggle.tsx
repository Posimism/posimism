"use client";
import { signOut } from "aws-amplify/auth";
import { Button } from "@/components/ui/button_shad_default";
import { useState } from "react";
import "@aws-amplify/ui-react/styles.css";
import { useAuthDialog } from "@/components/AuthenticatorModal";
import { useAuthenticator } from '@aws-amplify/ui-react';

export const LogInOutToggle = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { openSignIn } = useAuthDialog();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setIsLoading(false);
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false);
    }
  };

  // Check if user is authenticated
  if (authStatus === 'authenticated') {
    return (
      <Button
        variant="outline"
        className="bg-transparent"
        onClick={handleSignOut}
        disabled={isLoading}
      >
        {isLoading ? "Signing out..." : "Sign out"}
      </Button>
    );
  } else {
    return (
      <Button 
        variant="outline" 
        className="bg-transparent"
        onClick={openSignIn}
      >
        Sign in
      </Button>
    );
  }
};