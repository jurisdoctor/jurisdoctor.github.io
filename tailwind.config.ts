import type { Config } from "tailwindcss";

const config: Config = {
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
        drift1: "drift1 7s ease-in-out infinite",
        drift2: "drift2 6s ease-in-out infinite",
        drift3: "drift3 5.5s ease-in-out infinite",
        drift4: "drift4 8s ease-in-out infinite",
        drift5: "drift5 9s ease-in-out infinite",
        drift6: "drift6 5s ease-in-out infinite",
        drift7: "drift7 7.5s ease-in-out infinite",
        drift8: "drift8 10s linear infinite",
        drift9: "drift9 4.5s ease-in-out infinite",
        drift10: "drift10 6.5s ease-in-out infinite",
        drift11: "drift11 8.5s ease-in-out infinite",
        drift12: "drift12 11s linear infinite",
        fillBar: "fillBar 1.5s ease-out forwards",
        indeterminate: "indeterminate 1.8s ease-in-out infinite",
        fadeIn: "fadeIn 0.6s ease-out both",
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
        // wide moon-arc loop, returns through home
        drift1: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%": { transform: "translate(35vw, -25vh) rotate(180deg)" },
          "50%": { transform: "translate(45vw, 0) rotate(360deg)" },
          "75%": { transform: "translate(25vw, 25vh) rotate(540deg)" },
        },
        // propel out then snap back home
        drift2: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "40%": { transform: "translate(-40vw, 30vh) rotate(360deg)" },
          "55%": { transform: "translate(-42vw, 32vh) rotate(380deg)" },
          "70%": { transform: "translate(0, 0) rotate(720deg)" },
        },
        // horizontal zigzag, bounded
        drift3: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "20%": { transform: "translate(20vw, -15vh) rotate(90deg)" },
          "40%": { transform: "translate(40vw, 10vh) rotate(-60deg)" },
          "60%": { transform: "translate(15vw, 25vh) rotate(180deg)" },
          "80%": { transform: "translate(-15vw, 10vh) rotate(-120deg)" },
        },
        // upward propel and return
        drift4: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "35%": { transform: "translate(35vw, -30vh) rotate(-270deg)" },
          "65%": { transform: "translate(-25vw, -25vh) rotate(-540deg)" },
        },
        // figure-eight loop
        drift5: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "16%": { transform: "translate(-30vw, -20vh) rotate(60deg)" },
          "33%": { transform: "translate(-45vw, 10vh) rotate(120deg)" },
          "50%": { transform: "translate(0, 25vh) rotate(180deg)" },
          "66%": { transform: "translate(40vw, 10vh) rotate(240deg)" },
          "83%": { transform: "translate(30vw, -20vh) rotate(300deg)" },
        },
        // diagonal cross with spin and rebound
        drift6: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "30%": { transform: "translate(-40vw, -25vh) rotate(450deg)" },
          "50%": { transform: "translate(-15vw, 15vh) rotate(720deg)" },
          "75%": { transform: "translate(35vw, 20vh) rotate(900deg)" },
        },
        // pendulum swing, side to side arc
        drift7: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%": { transform: "translate(-35vw, 15vh) rotate(-45deg)" },
          "50%": { transform: "translate(0, 0) rotate(0deg)" },
          "75%": { transform: "translate(35vw, 15vh) rotate(45deg)" },
        },
        // elliptical orbit
        drift8: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%": { transform: "translate(40vw, -15vh) rotate(90deg)" },
          "50%": { transform: "translate(0, -30vh) rotate(180deg)" },
          "75%": { transform: "translate(-40vw, -15vh) rotate(270deg)" },
        },
        // quick darts in random directions
        drift9: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "20%": { transform: "translate(25vw, 20vh) rotate(120deg)" },
          "25%": { transform: "translate(0, 0) rotate(180deg)" },
          "50%": { transform: "translate(-20vw, -25vh) rotate(-90deg)" },
          "55%": { transform: "translate(0, 0) rotate(0deg)" },
          "80%": { transform: "translate(30vw, -10vh) rotate(220deg)" },
          "85%": { transform: "translate(0, 0) rotate(360deg)" },
        },
        // slow lazy loop
        drift10: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "33%": { transform: "translate(20vw, 30vh) rotate(120deg)" },
          "66%": { transform: "translate(-30vw, 20vh) rotate(-200deg)" },
        },
        // jittery long-distance pull then release
        drift11: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "45%": { transform: "translate(40vw, -30vh) rotate(540deg)" },
          "55%": { transform: "translate(38vw, -28vh) rotate(560deg)" },
          "70%": { transform: "translate(0, 0) rotate(720deg)" },
        },
        fillBar: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        indeterminate: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // full orbital circle
        drift12: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "12.5%": { transform: "translate(25vw, -20vh) rotate(45deg)" },
          "25%": { transform: "translate(40vw, 0) rotate(90deg)" },
          "37.5%": { transform: "translate(25vw, 20vh) rotate(135deg)" },
          "50%": { transform: "translate(0, 30vh) rotate(180deg)" },
          "62.5%": { transform: "translate(-25vw, 20vh) rotate(225deg)" },
          "75%": { transform: "translate(-40vw, 0) rotate(270deg)" },
          "87.5%": { transform: "translate(-25vw, -20vh) rotate(315deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
