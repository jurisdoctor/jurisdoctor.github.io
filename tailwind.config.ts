import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      "2xl": { max: "1535px" },
      // => @media (max-width: 1535px) { ... }

      xl: { max: "1279px" },
      // => @media (max-width: 1279px) { ... }

      lg: { max: "1023px" },
      // => @media (max-width: 1023px) { ... }

      md: { max: "767px" },
      // => @media (max-width: 767px) { ... }

      sm: { max: "576px" },
      // => @media (max-width: 576px) { ... }

      xs: { max: "350px" },
      // => @media (max-width: 576px) { ... }
    },
    extend: {
      animation: {
        mouseBounce: "animateMouse 1s linear infinite",
        dribbleSway: "animateSway 2s linear infinite",
        fillBar: "fillBar 1.5s ease-out forwards",
        strike: "strike 2.6s ease-in-out infinite",
        mark: "mark 2.6s ease-in-out infinite",
        indeterminate: "indeterminate 1.8s ease-in-out infinite",
        fadeIn: "fadeIn 0.6s ease-out both",
        tileBounce: "tileBounce 1.6s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        animateMouse: {
          "0%, 100%": {
            top: "29%",
          },
          "15%, 50%": {
            top: "50%",
          },
        },
        animateSway: {
          "0%,60%,100%": { transform: "rotate(0.0deg)" },
          "10%,30%": { transform: "rotate(24deg)" },
          "20%": { transform: "rotate(-18deg)" },
          "40%": { transform: "rotate(-34deg)" },
          "50%": { transform: "rotate(10.0deg)" },
        },
        fillBar: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        // slides in under the digit you round at, holds, clears, repeats
        mark: {
          "0%": { transform: "scaleX(0)", opacity: "1" },
          "30%": { transform: "scaleX(1)", opacity: "1" },
          "75%": { transform: "scaleX(1)", opacity: "1" },
          "88%": { transform: "scaleX(1)", opacity: "0" },
          "89%": { transform: "scaleX(0)", opacity: "0" },
          "100%": { transform: "scaleX(0)", opacity: "0" },
        },
        // draws through, holds, clears, then does it again
        strike: {
          "0%": { width: "0%", opacity: "1" },
          "30%": { width: "100%", opacity: "1" },
          "75%": { width: "100%", opacity: "1" },
          "88%": { width: "100%", opacity: "0" },
          "89%": { width: "0%", opacity: "0" },
          "100%": { width: "0%", opacity: "0" },
        },
        indeterminate: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        tileBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
