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
      colors: {
        bismark: {
          /* https://www.tailwindshades.com/#color=194.44444444444446%2C28.421052631578952%2C37.254901960784316&step-up=8&step-down=13&hue-shift=-8&name=bismark&base-stop=7&v=1&overrides=e30%3D */
          DEFAULT: "#446D7A",
          50: "#DCE9EB",
          100: "#CFE1E4",
          200: "#B5D0D5",
          300: "#9ABFC7",
          400: "#80ADB8",
          500: "#669BAA",
          600: "#538594",
          700: "#446D7A",
          800: "#2C464F",
          900: "#152025",
          950: "#090E10",
        },
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-400px)" },
        },
        slowFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        customBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-0.25em)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "slow-float": "slowFloat 8s ease-in-out infinite",
        "custom-bounce": "customBounce 1s ease-in-out infinite both",
        "bounce-delay-0": "customBounce 1s ease-in-out infinite both",
        "bounce-delay-150": "customBounce 1s ease-in-out infinite both 150ms",
        "bounce-delay-300": "customBounce 1s ease-in-out infinite both 300ms",
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          "animate-duration": (value) => ({
            animationDuration: value,
          }),
        },
        { values: theme("transitionDuration") }
      );
      matchUtilities(
        {
          "animate-delay": (value) => ({
            animationDelay: value,
          }),
        },
        { values: theme("transitionDelay") }
      );
      matchUtilities(
        {
          "animate-ease": (value) => ({
            animationTimingFunction: value,
          }),
        },
        { values: theme("transitionTimingFunction") }
      );
    }),
  ],
} satisfies Config;
