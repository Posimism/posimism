import { Button } from "@/components/ui/button_shad_default";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <>
      <div className="flex flex-col justify-center items-center space-y-2 w-full">
        <div className="flex justify-center py-2 w-full bg-white/30">
          <div className="relative px-2 z-10 text-left w-full max-w-2xl">
            <h1
              className={`text-center text-5xl font-bold text-gray-900 mb-6 font-pacifico`}
            >
              Posimism
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              <span className="font-semibold">posimism</span> | po-sə-ˌmiz-əm |
              (noun)
              <br />
              <strong>(1)</strong> A proactive form of optimism rooted in
              courage, resilience, altruism, faith, self-efficacy, and
              gratitude.
              <br />
              <strong>(2)</strong> The belief that even in the face of life’s
              hardships, a forward-focused and constructive attitude unlocks
              better outcomes—for oneself and the larger community.
              <br />
              “Practicing posimism helped Zoe cultivate a healthier outlook on
              challenges, improving both her mental well-being and her
              relationships.”
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <span className="absolute -translate-x-full pr-2">
            Get inspired with
          </span>
          <Button
            variant={"outline"}
            className="bg-white/40! border-neutral-500"
          >
            <Link href="/aichat">Posimism Bot ✨</Link>
          </Button>
        </div>
      </div>
      <footer className="z-10 absolute bottom-4 left-1/2 -translate-x-1/2">
        <a
          href="mailto:tommy@example.com"
          className="text-blue-500 hover:underline"
        >
          contactus@posimism.com
        </a>
      </footer>
    </>
  );
}
