/** @type {import('tailwindcss').Config} */
const withAlpha = (v) => `rgb(var(${v}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular'],
        display: ['PlayfairDisplay_700Bold'],
        'display-semibold': ['PlayfairDisplay_600SemiBold'],
      },
      colors: {
        // French Republic (fixed across themes)
        'republican-blue': '#002654',
        'republican-white': '#ffffff',
        'republican-red': '#ce1126',
        // Semantic tokens — CSS variables that switch in dark mode.
        background: withAlpha('--color-background'),
        foreground: withAlpha('--color-foreground'),
        card: withAlpha('--color-card'),
        'card-foreground': withAlpha('--color-card-foreground'),
        primary: withAlpha('--color-primary'),
        'primary-foreground': withAlpha('--color-primary-foreground'),
        secondary: withAlpha('--color-secondary'),
        'secondary-foreground': withAlpha('--color-secondary-foreground'),
        muted: withAlpha('--color-muted'),
        'muted-foreground': withAlpha('--color-muted-foreground'),
        accent: withAlpha('--color-secondary'),
        destructive: withAlpha('--color-destructive'),
        'destructive-foreground': withAlpha('--color-destructive-foreground'),
        success: withAlpha('--color-success'),
        'success-foreground': withAlpha('--color-success-foreground'),
        warning: withAlpha('--color-warning'),
        'warning-foreground': withAlpha('--color-warning-foreground'),
        border: withAlpha('--color-border'),
        input: withAlpha('--color-border'),
        ring: withAlpha('--color-primary'),
      },
    },
  },
  plugins: [],
};
