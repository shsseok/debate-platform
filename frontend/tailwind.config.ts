import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
        },
        pro: {
          DEFAULT: '#3b82f6',
          light: '#dbeafe',
          foreground: '#ffffff',
        },
        con: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          foreground: '#ffffff',
        },
        background: '#0f0f13',
        surface: '#1a1a24',
        border: '#2a2a3a',
        muted: '#6b7280',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [],
}

export default config
