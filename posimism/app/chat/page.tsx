import { ChatWindow as Chat } from "@/components/Chat";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <div className="w-full max-w-md mx-auto bg-gAiChatray-100 p-4 pt-0 rounded-lg shadow-lg size-10">
        <Chat />
      </div>
    </Suspense>
  );
}
