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
          primary: "#22b7dc",
          secondary: "#ffffff",
          accent: "#ff5603",
          neutral: "#000000",
          "base-100": "#e5e7eb",  // Gray background for entire webpage
          info: "#5e5e5e",
          success: "#17b26a",
          warning: "#e99717",
          error: "#cc1016",
        },
      },
    ],
  },
};
