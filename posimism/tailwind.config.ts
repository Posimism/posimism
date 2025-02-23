import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-400px)" },
        },
        slowFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "slow-float": "slowFloat 8s ease-in-out infinite",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      const newUtilities = {
        ".animation-delay-200": {
          "animation-delay": "0.2s",
        },
        ".animation-delay-400": {
          "animation-delay": "0.4s",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    }),
  ],
} satisfies Config;
