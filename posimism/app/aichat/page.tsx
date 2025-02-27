// app/aichat/page.tsx
import Chat from "@/components/Chat";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-tr from-purple-300 via-blue-200 to-green-300 overflow-hidden">
      <Suspense fallback={<div>Loading chat...</div>}>
        <Chat />
      </Suspense>
    </div>
  );
}
