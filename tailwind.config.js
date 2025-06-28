/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: "#3498db",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#2ecc71",
            foreground: "#ffffff",
          },
          accent: {
            DEFAULT: "#f39c12",
            foreground: "#ffffff",
          },
          background: {
            DEFAULT: "#f5f7fa",
          },
          foreground: {
            DEFAULT: "#2c3e50",
          },
          muted: {
            DEFAULT: "#f8f9fa",
            foreground: "#7f8c8d",
          },
          destructive: {
            DEFAULT: "#e74c3c",
            foreground: "#ffffff",
          },
        },
        fontFamily: {
          sans: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"],
        },
        boxShadow: {
          card: "0 4px 12px rgba(0, 0, 0, 0.05)",
          "card-hover": "0 8px 16px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    plugins: [],
  }
  
  