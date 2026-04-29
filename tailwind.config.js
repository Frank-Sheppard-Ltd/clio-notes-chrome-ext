/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./app.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f172a',
        surface: '#1e293b',
        'surface-soft': '#334155',
        'surface-strong': '#475569',
        border: '#334155',
        line: '#475569',
        accent: '#6366f1',
        'accent-ink': '#ffffff',
        muted: '#94a3b8',
        text: '#f8fafc',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'sm': '0 8px 22px rgba(17, 24, 39, 0.08)',
        'md': '0 18px 45px rgba(17, 24, 39, 0.12)',
        'dark-sm': '0 10px 28px rgba(0, 0, 0, 0.35)',
        'dark-md': '0 20px 54px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
