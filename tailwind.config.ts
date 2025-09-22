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
        // Gaming-specific neon colors
        neon: {
          green: "hsl(var(--neon-green))",
          blue: "hsl(var(--neon-blue))",
          red: "hsl(var(--neon-red))",
          purple: "hsl(var(--neon-purple))",
          yellow: "hsl(var(--neon-yellow))",
        },
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-danger": "var(--gradient-danger)",
        "gradient-game": "var(--gradient-game)",
        "gradient-neon": "var(--gradient-neon)",
      },
      boxShadow: {
        "neon-green": "var(--shadow-neon-green)",
        "neon-blue": "var(--shadow-neon-blue)",
        "neon-red": "var(--shadow-neon-red)",
        "game": "var(--shadow-game)",
      },
      transitionTimingFunction: {
        "smooth": "var(--transition-smooth)",
        "bounce": "var(--transition-bounce)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse-neon": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--neon-green) / 0.5)",
          },
          "50%": {
            boxShadow: "0 0 30px hsl(var(--neon-green) / 0.8), 0 0 40px hsl(var(--neon-green) / 0.4)",
          },
        },
        "glow": {
          "0%, 100%": {
            textShadow: "0 0 20px currentColor",
          },
          "50%": {
            textShadow: "0 0 30px currentColor, 0 0 40px currentColor",
          },
        },
        "bounce-scale": {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
        },
        "crash-pulse": {
          "0%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 hsl(var(--neon-red) / 0.7)",
          },
          "70%": {
            transform: "scale(1.1)",
            boxShadow: "0 0 0 20px hsl(var(--neon-red) / 0)",
          },
          "100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 hsl(var(--neon-red) / 0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "bounce-scale": "bounce-scale 0.6s ease-in-out infinite",
        "crash-pulse": "crash-pulse 1s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
