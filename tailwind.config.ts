import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        mouseBounce: "animateMouse 1s linear infinite",
        dribbleSway: "animateSway 2s linear infinite",
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
          "10%,30%": { transform: "rotate(14deg)" },
          "20%": { transform: "rotate(-8deg)" },
          "40%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(10.0deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
