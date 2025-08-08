import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [daisyui],
  daisyui: {
    themes: [
      // your custom light-forest theme
      {
        "light-forest": {
          "primary": "#237a57",
          "primary-focus": "#186649",
          "primary-content": "#ffffff",
          "secondary": "#3eae62",
          "secondary-focus": "#329858",
          "secondary-content": "#96C97B",
          "accent": "#becc24",
          "accent-focus": "#a6b01e",
          "accent-content": "#ffffff",
          "neutral": "#E3FFCF",
          "neutral-focus": "#e5e5e5",
          "neutral-content": "#253235",
          "base-100": "#ffffff",
          "base-200": "#f2f2f2",
          "base-300": "#e5e5e5",
          "base-content": "#253235",
          "info": "#2094f3",
          "success": "#009485",
          "warning": "#ff9900",
          "error": "#ff5724"
        }
      },
      // DaisyUI’s built-in dark “forest”
      "forest"
    ],
  },
};
