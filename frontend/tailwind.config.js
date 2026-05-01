/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1", // Indigo
        secondary: "#8b5cf6", // Purple
        blueflame: "#2563eb",
      },
    },
  },
  plugins: [],
};
