import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#171614',
        'dark-2': '#1F1D1A',
        'dark-3': '#26231F',
        cream: '#FFF4E6',
        gold: '#BFA176',
        'gold-dark': '#8B7355',
        'gold-light': '#E8D5B5',
        muted2: '#8A7E6B',
      },
      fontFamily: {
        heading: ['var(--font-cormorant)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: { pill: '999px' },
      boxShadow: {
        card: '0 8px 32px rgba(0,0,0,.3)',
        image: '0 16px 48px rgba(0,0,0,.4)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        fadeUp: 'fadeUp .7s ease-out both',
      },
    },
  },
  plugins: [],
};
export default config;
