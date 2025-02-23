import { Pacifico } from "next/font/google";
import React from "react";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-tr from-purple-300 via-blue-200 to-green-300 overflow-hidden">
      <div className="relative z-10 text-left w-full max-w-2xl">
        <h1
          className={`text-center text-5xl font-bold text-gray-900 mb-6 ${pacifico.className}`}
        >
          Posimism
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          <span className="font-semibold">posimism</span> | po-sə-ˌmiz-əm |
          (noun)
          <br />
          <strong>(1)</strong> A proactive form of optimism rooted in courage,
          resilience, altruism, faith, self-efficacy, and gratitude.
          <br />
          <strong>(2)</strong> The belief that even in the face of life’s
          hardships, a forward-focused and constructive attitude unlocks better
          outcomes—for oneself and the larger community.
          <br />
          “Practicing posimism helped Zoe cultivate a healthier outlook on
          challenges, improving both her mental well-being and her
          relationships.”
        </p>
      </div>
      <footer className="z-10 absolute bottom-4 left-1/2 -translate-x-1/2">
        <a
          href="mailto:tommy@example.com"
          className="text-blue-500 hover:underline"
        >
          contactus@posimism.com
        </a>
      </footer>
    </div>
  );
}
