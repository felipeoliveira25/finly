import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F0F0F',
        surface: '#1A1A1A',
        'surface-elevated': '#242424',
        border: '#2E2E2E',
        'text-primary': '#F5F5F5',
        'text-secondary': '#8A8A8A',
        accent: '#22C55E',
        'accent-negative': '#EF4444',
        'accent-info': '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
