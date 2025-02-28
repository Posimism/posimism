"use client";
import { cn } from "@/utils/tailwind-utils";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useUserID } from "@/utils/amplify-utils-client";
import {
  CreateChat,
  FrontEndMessage,
  GetOrCreateAIChat,
  SendAIChatMessage,
} from "@/utils/api";
import { SubscribeToAIChatMessages } from "../utils/api";
import { PiNotePencilLight } from "react-icons/pi";
import { Button } from "./ui/button_shad_default";
import { debounce } from "lodash";

type ChatMessageProps = {
  message: FrontEndMessage;
  onReact?: (messageId: string, reaction: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const SystemMessage: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center my-4">
    <div className="flex-grow border-t border-gray-400"></div>
    <span className="px-2 text-gray-600 text-sm">{text}</span>
    <div className="flex-grow border-t border-gray-400"></div>
  </div>
);

/* const QuickActions: React.FC<{
  message: FrontEndMessage;
  onReact: (messageId: string, reaction: string) => void;
}> = ({ message, onReact }) => {
  const reactions = message.reactions || {};

  return (
    <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center space-x-2 bg-white p-1.5 rounded-full shadow-md z-10">
      <button
        onClick={() => onReact(message.id, "👍")}
        className="hover:bg-gray-100 rounded-full p-1 transition-colors"
      >
        <span className="text-lg">👍</span>
        {reactions["👍"] && (
          <span className="text-xs ml-1">{reactions["👍"]}</span>
        )}
      </button>
      <button
        onClick={() => onReact(message.id, "👎")}
        className="hover:bg-gray-100 rounded-full p-1 transition-colors"
      >
        <span className="text-lg">👎</span>
        {reactions["👎"] && (
          <span className="text-xs ml-1">{reactions["👎"]}</span>
        )}
      </button>
      {message.quickActions?.map((action) => (
        <button
          key={action}
          onClick={() => onReact(message.id, action)}
          className="hover:bg-gray-100 rounded-full p-1 transition-colors"
        >
          <span className="text-lg">{action}</span>
          {reactions[action] && (
            <span className="text-xs ml-1">{reactions[action]}</span>
          )}
        </button>
      ))}
    </div>
  );
}; */

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  className,
  ...props
}) => {
  const { createdAt, status, msg, isAi, streaming } = message;
  // if (isSystemMessage) {
  //   return <SystemMessage message={message} />;
  // }
  const outgoing = !isAi;
  const reactions = {} as { [emoji: string]: number }; // temporary

  // Display reactions if any exist
  const displayedReactions =
    reactions && Object.keys(reactions).length > 0 ? (
      <div
        className={cn(
          "flex flex-wrap gap-1 mt-1",
          outgoing ? "justify-end" : "justify-start"
        )}
      >
        {Object.entries(reactions).map(([emoji, count]) => (
          <span key={emoji} className="bg-white/30 rounded-full px-1.5 text-xs">
            {emoji} {count > 1 && count}
          </span>
        ))}
      </div>
    ) : null;

  return (
    <div
      className={cn(
        "group/msg relative mb-2", // Changed from mb-9 to mb-2
        outgoing && "flex justify-end"
      )}
    >
      <div
        {...props}
        className={cn(
          "flex flex-col max-w-8/10 break-words py-1.5 px-3 leading-5 rounded-2xl transition-all relative z-0",
          outgoing
            ? "items-end bg-gradient-to-r from-blue-400 to-cyan-400 shadow-md hover:shadow-lg text-white"
            : "bg-white shadow-[0_0_15px_rgba(255,182,193,0.7),0_0_5px_rgba(255,105,180,0.4)]",
          className
        )}
      >
        <div className="font-medium">
          {msg}
          {streaming && (
            <span className="inline-flex ml-1">
              <span
                className="animate-bounce"
                style={{ animationDelay: "0ms" }}
              >
                •
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "150ms" }}
              >
                •
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "300ms" }}
              >
                •
              </span>
            </span>
          )}
        </div>
        <div
          className={cn(
            "flex space-x-1 text-xs mt-1",
            outgoing ? "text-blue-50/90" : "text-indigo-900/70"
          )}
        >
          <span>
            {new Date(createdAt).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "numeric",
            })}
          </span>
          {outgoing && (
            <div className="hidden group-last/msg:inline">
              {status === "pending" ? (
                <span className="animate-pulse">• Sending...</span>
              ) : status === "failed" ? (
                <span className="text-red-500">• Failed</span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
        {displayedReactions}
      </div>
      {/* <QuickActions message={message} onReact={onReact} /> */}
    </div>
  );
};

// Input bar component with send button
const InputBar: React.FC<{
  chatID: string;
}> = ({ chatID }) => {
  const [inputValue, setInputValue] = useState("");
  const auth = useUserID();
  const { mutate: sendMessage, isPending } = SendAIChatMessage(auth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(
        { chatID, text: inputValue },
        {
          onError: () =>
            setInputValue((curr) => {
              if (inputValue != curr) {
                return inputValue + curr;
              }
              return curr;
            }),
        }
      );
      setInputValue("");
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Set the height to match content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Adjust textarea height when input value changes
  useEffect(() => {
    autoResizeTextarea();
  }, [inputValue]);

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex items-stretch bg-white rounded-3xl px-4 py-1.5 mt-2 shadow-md"
      >
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full outline-none text-gray-700 resize-none min-h-[24px] max-h-[150px] py-1.5 overflow-y-auto"
          rows={1}
          onInput={autoResizeTextarea}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isPending}
          className={cn(
            "ml-2 p-2 rounded-full flex items-center justify-center transition-colors aspect-square self-end",
            inputValue.trim()
              ? "bg-gradient-to-r from-blue-400 to-cyan-400 text-white"
              : "bg-gray-200 text-gray-400"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 -rotate-45"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-2">
        The contents of this chat may be reviewed to improve Posimism.com
      </p>
    </>
  );
};

const MessageFeed: React.FC<{ chatID: string }> = ({ chatID }) => {
  const auth = useUserID();
  const { data: messages } = SubscribeToAIChatMessages({
    chatID,
    auth,
  });
  const { mutate: createNewChat, isPending: isCreatingChat } = CreateChat(auth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCreateNewChat = useCallback(
    debounce(() => createNewChat(), 2000, { leading: true }),
    [createNewChat]
  );

  // Add ref for the container div
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // Scroll to bottom when messages change or load
  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages]);

  return !messages ? (
    <div className="flex justify-center my-4">
      <div className="animate-pulse text-gray-500">Loading messages...</div>
    </div>
  ) : messages.length === 0 ? (
    <div className="text-center text-gray-500 my-8">
      No messages yet. Start a conversation!
    </div>
  ) : (
    <>
      <Button
        variant="outline"
        className="absolute self-end px-1! z-10"
        onClick={handleCreateNewChat}
        disabled={isCreatingChat}
      >
        <PiNotePencilLight className="size-8" />
      </Button>
      {messages.map((msg, i) => {
        const thisDate = new Date(msg.createdAt);
        if (
          i == 0 ||
          thisDate.getTime() - new Date(messages[i - 1].createdAt).getTime() >
            1000 * 60 * 15
        ) {
          return (
            <Fragment key={msg.id}>
              <SystemMessage
                key={msg.id}
                text={formattedDateString(thisDate)}
              />
              <ChatMessage message={msg} />
            </Fragment>
          );
        }
        return (
          <Fragment key={msg.id}>
            <ChatMessage message={msg} />
          </Fragment>
        );
      })}
      {/* Add an empty div at the end to scroll to */}
      <div ref={messagesEndRef} />
    </>
  );
};

/**
 * Formats a date object into the most relevant short format
 * Creates this string by deciding the inputs to Date.toLocaleString()
 * @param date A date object that needs to be formatted
 */
const formattedDateString = (date: Date) => {
  const now = new Date();

  // Same day check
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // Yesterday check
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return (
      "Yesterday at " +
      date.toLocaleString(undefined, { hour: "numeric", minute: "2-digit" })
    );
  }

  // Within the last week
  const sixDaysAgo = new Date(now);
  sixDaysAgo.setDate(now.getDate() - 6);

  if (date >= sixDaysAgo) {
    return (
      date.toLocaleString(undefined, { weekday: "long" }) +
      " at " +
      date.toLocaleString(undefined, { hour: "numeric", minute: "2-digit" })
    );
  }

  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleString(undefined, { month: "short", day: "numeric" });
  }

  // Different year
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ChatWindow = () => {
  const userIDState = useUserID();
  const { data: chats } = GetOrCreateAIChat(userIDState || null);
  const { id: currentChatID } = (chats && chats[0]) || {};

  return (
    <div className="flex flex-col">
      <div className="flex flex-col space-y-2 mb-2 overflow-y-auto max-h-[400px] p-2">
        {currentChatID && <MessageFeed chatID={currentChatID} />}
      </div>
      {currentChatID && <InputBar chatID={currentChatID} />}
    </div>
  );
};

export default ChatWindow;
