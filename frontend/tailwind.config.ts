import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: "#1a1a2e",
        "sidebar-hover": "#16213e",
        "sidebar-active": "#0f3460",
        accent: "#e94560",
        "accent-hover": "#c73652",
      },
    },
  },
  plugins: [],
};

export default config;
