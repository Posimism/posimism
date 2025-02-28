"use client";

import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
} from "react";
import { AuthUser } from "aws-amplify/auth";
import * as React from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Create context for auth dialog
interface AuthDialogContextType {
  isOpen: boolean;
  initialState: "signIn" | "signUp";
  openSignIn: () => void;
  openSignUp: () => void;
  closeAuthDialog: () => void;
  setAuthDialogOpen: (open: boolean) => void;
  onAuthSuccess: (user: AuthUser) => void;
  hideSignUp?: boolean;
  variation?: "default" | "modal";
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(
  undefined
);

export function AuthDialogProvider({
  children,
  onAuthSuccess,
  hideSignUp = false,
  variation = "default",
}: {
  children: React.ReactNode;
  onAuthSuccess?: (user: AuthUser) => void;
  hideSignUp?: boolean;
  variation?: "default" | "modal";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialState, setInitialState] = useState<"signIn" | "signUp">(
    "signIn"
  );

  const openSignIn = useCallback(() => {
    setInitialState("signIn");
    setIsOpen(true);
  }, []);

  const openSignUp = useCallback(() => {
    setInitialState("signUp");
    setIsOpen(true);
  }, []);

  const closeAuthDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleAuthSuccess = useCallback(
    (user: AuthUser) => {
      onAuthSuccess?.(user);
    },
    [onAuthSuccess]
  );

  const value = {
    isOpen,
    initialState,
    openSignIn,
    openSignUp,
    closeAuthDialog,
    setAuthDialogOpen: setIsOpen,
    onAuthSuccess: handleAuthSuccess,
    hideSignUp,
    variation,
  };

  return (
    <Authenticator.Provider>
      <AuthDialogContext.Provider value={value}>
        {children}
        <AuthDialog />
      </AuthDialogContext.Provider>
    </Authenticator.Provider>
  );
}

export function useAuthDialog(): AuthDialogContextType {
  const context = useContext(AuthDialogContext);
  if (!context) {
    throw new Error("useAuthDialog must be used within an AuthDialogProvider");
  }
  return context;
}

// AuthDialog now consumes the context directly
function AuthDialog() {
  const {
    isOpen,
    initialState,
    setAuthDialogOpen,
    onAuthSuccess,
    hideSignUp = false,
    variation = "default",
  } = useAuthDialog();

  return (
    <Dialog open={isOpen} onOpenChange={setAuthDialogOpen}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl">
        <AuthDialogContent
          initialState={initialState}
          hideSignUp={hideSignUp}
          variation={variation}
          onOpenChange={setAuthDialogOpen}
          onAuthSuccess={onAuthSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function AuthDialogContent({
  initialState,
  hideSignUp,
  variation,
  onOpenChange,
  onAuthSuccess,
}: {
  initialState: "signIn" | "signUp";
  hideSignUp: boolean;
  variation: "default" | "modal";
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: (user: AuthUser) => void;
}) {
  const { authStatus, user } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
  ]);

  useEffect(() => {
    if (authStatus === "authenticated" && user) {
      onOpenChange(false);
      onAuthSuccess?.(user as AuthUser);
    }
  }, [authStatus, user, onOpenChange, onAuthSuccess]);

  return (
    <Authenticator
      initialState={initialState}
      hideSignUp={hideSignUp}
      variation={variation}
    />
  );
}
