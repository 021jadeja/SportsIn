import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        SportsIn: {
          primary: "#22b7dc",     // AliceBlue from logo
          secondary: "#ffffff",   // White
          accent: "#ff5603",      // OrangeRed from logo
          neutral: "#000000",     // Black text
          "base-100": "#f9f9f9",  // Light background
          info: "#5e5e5e",        // Secondary text / labels
          success: "#17b26a",     // Rich green
          warning: "#e99717",     // DarkOrange from logo
          error: "#cc1016",       // Strong red
        },
      },
    ],
  },
};
