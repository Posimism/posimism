// import { Schema } from "@/amplify/data/resource";
import Chat from "@/components/Chat";
// import { generateClient } from "aws-amplify/data";

export default function Home() {
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-tr from-purple-300 via-blue-200 to-green-300 overflow-hidden">
      <Chat/>
    </div>
  );
}
