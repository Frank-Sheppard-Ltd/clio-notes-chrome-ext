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
        bg: '#fafafa', // Zinc 50
        surface: '#ffffff',
        'surface-soft': '#f4f4f5', // Zinc 100
        'surface-strong': '#e4e4e7', // Zinc 200
        border: '#e4e4e7', // Zinc 200
        line: '#d4d4d8', // Zinc 300
        accent: '#2563eb', // Electric Blue (Royal/Blue)
        'accent-ink': '#ffffff',
        muted: '#71717a', // Zinc 500
        text: '#09090b', // Zinc 950
        success: '#10b981', // Emerald
        danger: '#f43f5e', // Rose
        warning: '#f59e0b', // Amber
        // Dark Mode Override Variables (we will also bind these to custom CSS variables)
        dark: {
          bg: '#09090b', // Zinc 950
          surface: '#18181b', // Zinc 900
          'surface-soft': '#27272a', // Zinc 800
          'surface-strong': '#3f3f46', // Zinc 700
          border: '#27272a', // Zinc 800
          line: '#3f3f46', // Zinc 700
          accent: '#3b82f6', // Bright Electric Blue
          muted: '#a1a1aa', // Zinc 400
          text: '#fafafa', // Zinc 50
        }
      },
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'sm': '0 8px 30px rgba(9, 9, 11, 0.04)',
        'md': '0 20px 50px rgba(9, 9, 11, 0.08)',
        'dark-sm': '0 10px 30px rgba(0, 0, 0, 0.5)',
        'dark-md': '0 25px 60px rgba(0, 0, 0, 0.65)',
        'refraction': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'refraction-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
