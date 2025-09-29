import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Cyberpunk neon colors
        neon: {
          cyan: "hsl(var(--neon-cyan))",
          magenta: "hsl(var(--neon-magenta))",
          purple: "hsl(var(--neon-purple))",
          green: "hsl(var(--neon-green))",
          red: "hsl(var(--neon-red))",
          yellow: "hsl(var(--neon-yellow))",
        },
        // Status colors
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        // Surface levels
        surface: {
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
          elevated: "hsl(var(--surface-elevated))",
        },
        glass: "hsl(var(--glass))",
      },
      fontFamily: {
        display: ["Orbitron", "Space Grotesk", "monospace"],
        body: ["Space Grotesk", "Inter", "sans-serif"],
        sans: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Monaco", "monospace"],
      },
      backgroundImage: {
        "gradient-neon-primary": "var(--gradient-neon-primary)",
        "gradient-neon-danger": "var(--gradient-neon-danger)",
        "gradient-neon-success": "var(--gradient-neon-success)",
        "gradient-glass": "var(--gradient-glass)",
        "gradient-chart-fill": "var(--gradient-chart-fill)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      transitionTimingFunction: {
        smooth: "var(--transition-smooth)",
        spring: "var(--transition-spring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "chart-draw": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        "value-change": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        "pulse-success": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--success) / 0.4)" },
          "70%": { boxShadow: "0 0 0 10px hsl(var(--success) / 0)" },
        },
        "pulse-danger": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--destructive) / 0.4)" },
          "70%": { boxShadow: "0 0 0 10px hsl(var(--destructive) / 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "chart-draw": "chart-draw 1.5s ease-out",
        "value-change": "value-change 0.3s ease-out",
        "pulse-success": "pulse-success 2s infinite",
        "pulse-danger": "pulse-danger 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
