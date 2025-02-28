"use client";

import {
  useState,
  useCallback,
  createContext,
  useContext,
  useEffect,
} from "react";
import { AuthUser } from "aws-amplify/auth";
import * as React from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

// Import Dialog components from your UI library
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

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
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(
  undefined
);

export function AuthDialogProvider({
  children,
  onAuthSuccess,
  hideSignUp = false,
}: {
  children: React.ReactNode;
  onAuthSuccess?: (user: AuthUser) => void;
  hideSignUp?: boolean;
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
  };

  return (
    <Authenticator.Provider>
      <AuthDialogContext.Provider value={value}>
        {children}
        {isOpen && <AuthenticatorModal />}
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

function AuthenticatorModal() {
  const {
    isOpen,
    initialState,
    setAuthDialogOpen,
    onAuthSuccess,
    hideSignUp = false,
  } = useAuthDialog();

  const { authStatus, user } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
  ]);

  useEffect(() => {
    if (authStatus === "authenticated" && user) {
      setAuthDialogOpen(false);
      onAuthSuccess?.(user as AuthUser);
    }
  }, [authStatus, user, setAuthDialogOpen, onAuthSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={setAuthDialogOpen}>
      <DialogContent className="max-w-md sm:max-w-lg">
        {/* Add the required accessibility elements */}
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <DialogDescription className="sr-only">
          Sign in or create an account
        </DialogDescription>

        {/* The Authenticator itself, not in modal mode */}
        <Authenticator
          initialState={initialState}
          hideSignUp={hideSignUp}
          // Remove the variation="modal" and modalProps
        />
      </DialogContent>
    </Dialog>
  );
}
