/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // French Republic
        'republican-blue': '#002654',
        'republican-white': '#ffffff',
        'republican-red': '#ce1126',
        // Semantic tokens (light theme, derived from web global.css)
        background: '#ffffff',
        foreground: '#0f172a',
        card: '#ffffff',
        'card-foreground': '#0f172a',
        primary: '#002654',
        'primary-foreground': '#f8fafc',
        secondary: '#f1f5f9',
        'secondary-foreground': '#1e293b',
        muted: '#f1f5f9',
        'muted-foreground': '#64748b',
        accent: '#f1f5f9',
        'accent-foreground': '#1e293b',
        destructive: '#ef4444',
        'destructive-foreground': '#f8fafc',
        success: '#16a34a',
        'success-foreground': '#f8fafc',
        warning: '#f59e0b',
        'warning-foreground': '#0f172a',
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#002654',
      },
    },
  },
  plugins: [],
};
