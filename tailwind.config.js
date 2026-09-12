/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["var(--font-sora)", "sans-serif"],
      },
      colors: {
        background: {
          DEFAULT: "#09070C",
          secondary: "#15060D",
        },
        surface: {
          card: "#1E100F",
          elevated: "#201211",
          hover: "#2A1817",
        },
        text: {
          primary: "#F5F2F2",
          secondary: "#C5BFC1",
          muted: "#A39DA0",
        },
        brand: {
          gold: "#F4C542",
          orange: "#FF8A2A",
          red: "#E13D32",
          pink: "#F01867",
        },
        border: {
          DEFAULT: "#4A3214",
          subtle: "#2E1F0F",
          glow: "rgba(244, 197, 66, 0.35)",
        },
        live: "#35E879",
      },
      backgroundImage: {
        'brand-gradient': "linear-gradient(135deg, #F4C542 0%, #FF8A2A 45%, #E13D32 72%, #F01867 100%)",
        'brand-gradient-h': "linear-gradient(90deg, #F4C542 0%, #FF8A2A 45%, #E13D32 72%, #F01867 100%)",
        'card-gradient': "linear-gradient(180deg, rgba(32, 18, 17, 0.8) 0%, rgba(30, 16, 15, 0.95) 100%)",
      },
      boxShadow: {
        'glow-sm': "0 0 15px -3px rgba(255, 138, 42, 0.25)",
        'glow-md': "0 0 25px -4px rgba(225, 61, 50, 0.3)",
        'glow-gold': "0 0 20px -2px rgba(244, 197, 66, 0.25)",
        'live': "0 0 10px rgba(53, 232, 121, 0.6)",
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.8, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      },
      animation: {
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
        fadeIn: 'fadeIn 0.25s ease-out forwards',
        slideLeft: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
