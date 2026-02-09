/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        "bella-pulse": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
          "50%": { transform: "scale(1.03)", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)" },
        },
      },
      animation: {
        "bella-pulse": "bella-pulse 2.5s ease-in-out infinite",
      },
      colors: {
        background: "var(--color-background)",
        "background-secondary": "var(--color-background-secondary)",
        card: "var(--card-bg)",
        "card-foreground": "var(--color-text)",
        "background-tertiary": "var(--color-background-tertiary)",
        surface: "var(--color-surface)",
        "surface-muted": "var(--bg-surface-muted)",
        foreground: "var(--color-text)",
        muted: "var(--color-text-secondary)",
        "muted-foreground": "var(--color-text-tertiary)",
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
        },
        border: "var(--color-border)",
        "border-muted": "var(--color-background-tertiary)",
        "border-subtle": "var(--border-subtle)",
        danger: "var(--color-danger)",
        success: "var(--accent-success)",
        warning: "var(--accent-warning)",
      },
      borderRadius: {
        card: "var(--radius-2xl)",
        button: "var(--radius-md)",
        input: "var(--radius-md)",
      },
      spacing: {
        "rhythm-1": "8px",
        "rhythm-2": "16px",
        "rhythm-3": "24px",
        "rhythm-4": "32px",
      },
      fontFamily: {
        sans: ["system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
      });
    },
  ],
};
