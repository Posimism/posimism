// app/aichat/page.tsx
import { AiChatWindow as AiChat } from "@/components/Chat";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <div className="w-full max-w-md mx-auto bg-gray-100 p-4 pt-0 rounded-lg shadow-lg">
        <AiChat />
      </div>
    </Suspense>
  );
}
