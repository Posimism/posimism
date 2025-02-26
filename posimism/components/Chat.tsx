"use client";
/* eslint-disable @next/next/no-img-element */
import { cn } from "@/utils/tailwind-utils";
import { useState } from "react";

type MessageStatus = "pending" | "sent" | "delivered" | "read";

export interface Message {
  id: string;
  chatID: string;
  owner: string;
  createdAt: string;
  msg: string;
  isAi?: boolean;
  streaming?: boolean;
  status: MessageStatus;
  avatarUrl?: string;
  content?: React.ReactNode;
  parentID?: string;
  quickActions?: string[];
  isSystemMessage?: boolean;
  reactions?: Record<string, number>;
}

type ChatMessageProps = {
  message: Message;
  onReact?: (messageId: string, reaction: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const SystemMessage: React.FC<{ message: Message }> = ({ message }) => (
  <div className="flex items-center my-4">
    <div className="flex-grow border-t border-gray-400"></div>
    <span className="px-2 text-gray-600 text-sm">{message.msg}</span>
    <div className="flex-grow border-t border-gray-400"></div>
  </div>
);

const QuickActions: React.FC<{ 
  message: Message, 
  onReact: (messageId: string, reaction: string) => void 
}> = ({ message, onReact }) => {
  const reactions = message.reactions || {};
  
  return (
    <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center space-x-2 bg-white p-1.5 rounded-full shadow-md z-10">
      <button 
        onClick={() => onReact(message.id, "👍")}
        className="hover:bg-gray-100 rounded-full p-1 transition-colors"
      >
        <span className="text-lg">👍</span>
        {reactions["👍"] && <span className="text-xs ml-1">{reactions["👍"]}</span>}
      </button>
      <button 
        onClick={() => onReact(message.id, "👎")}
        className="hover:bg-gray-100 rounded-full p-1 transition-colors"
      >
        <span className="text-lg">👎</span>
        {reactions["👎"] && <span className="text-xs ml-1">{reactions["👎"]}</span>}
      </button>
      {message.quickActions?.map(action => (
        <button 
          key={action}
          onClick={() => onReact(message.id, action)}
          className="hover:bg-gray-100 rounded-full p-1 transition-colors"
        >
          <span className="text-lg">{action}</span>
          {reactions[action] && <span className="text-xs ml-1">{reactions[action]}</span>}
        </button>
      ))}
    </div>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  className,
  onReact = () => {},
  ...props
}) => {
  const {
    status,
    createdAt,
    msg,
    isAi,
    isSystemMessage,
    streaming,
    reactions,
  } = message;
  if (isSystemMessage) {
    return <SystemMessage message={message} />;
  }
  const outgoing = !isAi;

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
        "group/msg relative mb-2",  // Changed from mb-9 to mb-2
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
          <span>{createdAt}</span>
          {outgoing && (
            <div className="hidden group-last/msg:inline">
              {status === "pending" ? (
                <span className="animate-pulse">• Sending...</span>
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
      <QuickActions message={message} onReact={onReact} />
    </div>
  );
};

// Input bar component with send button
const InputBar: React.FC<{
  onSendMessage: (message: string) => void;
}> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-white rounded-full px-4 py-1.5 mt-2 shadow-md"
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 outline-none text-gray-700 min-w-0"
      />
      <button
        type="submit"
        disabled={!inputValue.trim()}
        className={cn(
          "ml-2 p-2 rounded-full flex items-center justify-center transition-colors",
          inputValue.trim()
            ? "bg-gradient-to-r from-blue-400 to-cyan-400 text-white"
            : "bg-gray-200 text-gray-400"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 rotate-45"
        >
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </form>
  );
};

const defaultMessages: Message[] = [
  {
    id: "1",
    msg: "Welcome to the chat!",
    status: "read",
    createdAt: "10:00 AM",
    isSystemMessage: true,
    chatID: "1",
    owner: "1",
  },
  {
    id: "2",
    msg: "Hello, how are you?",
    status: "read",
    createdAt: "10:01 AM",
    avatarUrl: "https://i.pravatar.cc/300",
    quickActions: ["👍", "❤️", "😂"],
    chatID: "1",
    owner: "1",
    reactions: { "👍": 1 },
  },
  {
    id: "3",
    msg: "I am doing well, thanks!",
    isAi: true,
    status: "delivered",
    createdAt: "10:02 AM",
    avatarUrl: "https://i.pravatar.cc/300?img=2",
    parentID: "Hello, how are you?",
    chatID: "1",
    owner: "1",
    reactions: { "❤️": 2 },
  },
  {
    id: "4",
    msg: "Check out this cool image.",
    status: "pending",
    createdAt: "10:03 AM",
    content: (
      <img
        src="https://www.imore.com/sites/imore.com/files/field/image/2014/11/imessage_iphone_6_star_emoji_hero_0.jpg"
        alt="sample"
        className="mt-2 rounded"
      />
    ),
    quickActions: ["👍", "❤️"],
    chatID: "1",
    owner: "1",
  },
  {
    id: "∆DKdk",
    msg: "Hello, how am I? Superduperswellalicious. beans and fritters and cheese and missin mom",
    status: "read",
    isAi: true,
    createdAt: "10:01 AM",
    avatarUrl: "https://i.pravatar.cc/300",
    quickActions: ["👍", "❤️", "😂"],
    chatID: "1",
    streaming: true,
    owner: "1",
  },
  {
    id: "5",
    msg: "Another standalonalony message",
    status: "read",
    createdAt: "10:04 AM",
    avatarUrl: "https://i.pravatar.cc/300",
    chatID: "1",
    owner: "1",
  },
];

const ChatWindow: React.FC<{
  messages?: Message[];
  onSendMessage: (message: string) => void;
  onReact: (messageId: string, reaction: string) => void;
}> = ({ messages = defaultMessages, onSendMessage, onReact }) => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col space-y-2 mb-2 overflow-y-auto max-h-[400px] p-2">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onReact={onReact} />
        ))}
      </div>
      <InputBar onSendMessage={onSendMessage} />
    </div>
  );
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(defaultMessages);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      msg: text,
      status: "pending",
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      chatID: "1",
      owner: "1",
      reactions: {},
    };

    setMessages([...messages, newMessage]);

    // Simulate message status changing to "delivered" after a small delay
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 1000);
  };

  const handleReact = (messageId: string, reaction: string) => {
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
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-100 p-4 rounded-lg shadow-lg">
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        onReact={handleReact}
      />
    </div>
  );
};

export default Chat;
