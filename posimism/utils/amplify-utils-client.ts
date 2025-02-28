import { useState, useEffect, useCallback } from "react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import type { AuthMode } from "@aws-amplify/data-schema/runtime";
import { useAuthenticator } from "@aws-amplify/ui-react";

export type UserIDResult = {
  id: string;
  isAuthenticated: boolean;
  authMode: AuthMode;
};

export type UserIDState = {
  id: string | null;
  isAuthenticated: boolean;
  authMode: AuthMode | null;
  isLoading: boolean;
  error: Error | null;
};

// Standalone function that can be used outside React components
export async function getUserID(): Promise<UserIDResult> {
  try {
    // Try to get authenticated user info first
    try {
      const { sub } = await fetchUserAttributes();
      if (!sub) {
        throw new Error("Could not get sub");
      }
      return {
        id: sub,
        isAuthenticated: true,
        authMode: "userPool" as AuthMode,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // User is not authenticated, get identity ID from credentials
      const session = await fetchAuthSession();
      const identityId = session.identityId;

      if (!identityId) {
        throw new Error("Could not get identity ID");
      }

      return {
        id: identityId,
        isAuthenticated: false,
        authMode: "identityPool" as AuthMode,
      };
    }
  } catch (error) {
    console.error("Error getting user identifier:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

// React hook for component usage
export function useUserID() {
  const [userState, setUserState] = useState<UserIDState>({
    id: null,
    isAuthenticated: false,
    authMode: null,
    isLoading: true,
    error: null,
  });

  // Subscribe to auth state changesn
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const fetchUserID = useCallback(async () => {
    setUserState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await getUserID();
      setUserState({
        ...result,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error getting user identifier:", error);
      setUserState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  }, []);

  useEffect(() => {
    fetchUserID();
  }, [fetchUserID, authStatus]);

  // Include a refresh method to allow manual refreshes
  return {
    ...userState,
    refresh: fetchUserID,
  };
}
