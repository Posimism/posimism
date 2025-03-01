import { dataClient } from "@/components/ConfigureAmplify";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { UserIDResult, UserIDState } from "./amplify-utils-client";
import { useEffect, useMemo } from "react";
import type { Schema } from "@/amplify/data/resource";

export type ApiUserAuthentication = UserIDResult | UserIDState | null;
export type ApiUserAuthWithChatID = { auth: ApiUserAuthentication } & {
  chatID: string;
};
// Get or create AIChat
export const GetOrCreateAIChat = (auth: ApiUserAuthentication) => {
  const { id: owner, authMode } = auth || {};
  const opts = queryOptions({
    queryKey: [owner, "AIChats"],
    queryFn: async () => {
      if (!dataClient || !owner || !authMode) return null;

      try {
        // First try to get existing chats
        const existingChats =
          await dataClient.models.AIChat.listAIChatByOwnerAndCreatedAt(
            { owner },
            { sortDirection: "DESC", limit: 1, authMode }
          );

        // If user has existing chats, use the most recent one
        if (existingChats.data && existingChats.data.length > 0) {
          return existingChats.data;
        }

        // Only create a new chat if no existing chats were found
        const response = await dataClient.models.AIChat.create(
          { owner, name: "New Chat" },
          { authMode }
        );

        return [response.data];
      } catch (error) {
        console.error("Error getting or creating chat:", error);
        throw error;
      }
    },
    enabled: Boolean(dataClient && owner),
    staleTime: Infinity, // Chat ID shouldn't change during the session
  });
  return useQuery(opts);
};
export const CreateChat = (auth: ApiUserAuthentication) => {
  const { id: owner, authMode } = auth || {};
  const queryClient = useQueryClient();

  return useMutation<Schema["AIChat"]["type"] | null>({
    mutationFn: async () => {
      if (!dataClient || !owner || !authMode)
        throw new Error("Not authenticated");
      const response = await dataClient.models.AIChat.create(
        { owner, name: "New Chat" },
        { authMode }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([owner, "AIChats"], (prev: unknown) => [
        data,
        ...(Array.isArray(prev) ? prev : []),
      ]);
    },
  });
};

export type MessageStatus =
  | "pending"
  | "failed"
  | "sent"
  | "delivered"
  | "read";
export type FrontEndMessage = Omit<
  Exclude<Schema["AiChatMessage"]["type"], null>,
  "__typename" | "chat" | "quickReplies"
> & {
  status: MessageStatus;
};

export const SubscribeToAIChatMessages = ({
  chatID,
  auth,
}: ApiUserAuthWithChatID) => {
  const { id: owner, authMode } = auth || {};
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => [owner, "AIChat", chatID, "messages"],
    [chatID, owner]
  );

  const opts = queryOptions<FrontEndMessage[]>({
    queryKey,
    queryFn: () => [],
    enabled: false,
  });

  useEffect(() => {
    if (!dataClient || !owner || !authMode) return;
    const subscription = dataClient.models.AiChatMessage.observeQuery({
      filter: { chatID: { eq: chatID } },
      authMode,
    }).subscribe({
      next: ({ items }) => {
        const formattedMessages = items
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map(
            (msg) =>
              ({
                ...msg,
                status: "read" as MessageStatus,
              } as FrontEndMessage)
          );

        // Update the query cache with the latest messages
        queryClient.setQueryData(queryKey, formattedMessages);
      },
      error: (error) => console.error("Subscription error:", error),
    });
    return () => subscription.unsubscribe();
  }, [authMode, chatID, owner, queryClient, queryKey]);

  return useQuery(opts);
};

export const SendAIChatMessage = (auth: ApiUserAuthentication) => {
  const { id: owner, authMode } = auth || {};
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chatID, text }: { chatID: string; text: string }) => {
      if (!dataClient || !owner || !authMode)
        throw new Error("Not authenticated");

      return await dataClient.mutations.createMessage(
        {
          chatID: chatID,
          msg: text,
        },
        {
          authMode,
        }
      );
    },
    onMutate: async ({ chatID, text }) => {
      if (!owner) return;
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const newMessage: FrontEndMessage = {
        owner,
        id: tempId,
        chatID,
        msg: text,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAi: false,
      };

      queryClient.setQueryData<FrontEndMessage[]>(
        [owner, "AIChat", chatID, "messages"],
        (prev) => [...(prev || []), newMessage]
      );
      return { tempId };
    },
    onError: (error, variables, context) => {
      console.error("Error sending message:", error);
      // Mark the message as failed
      queryClient.setQueryData<FrontEndMessage[]>(
        [owner, "AIChat", variables.chatID, "messages"],
        (prev) =>
          (prev || []).map((msg) =>
            msg.id === context?.tempId
              ? {
                  ...msg,
                  status: "failed",
                }
              : msg
          )
      );
    },
  });
};

/*
  const reactToMessageMutation = useMutation({
    mutationFn: async ({
      messageId,
      reaction,
    }: {
      messageId: string;
      reaction: string;
    }) => {
      // TODO: Implement backend API call when available
      return { messageId, reaction };
    },
    onMutate: ({ messageId, reaction }) => {
      // Optimistic update for reactions
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const currentReactions = msg.reactions || {};
            return {
              ...msg,
              reactions: {
                ...currentReactions,
                [reaction]: (currentReactions[reaction] || 0) + 1,
              },
            };
          }
          return msg;
        })
      );
    },
  });
  */
