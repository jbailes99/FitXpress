import type { Config } from 'tailwindcss'
const withMT = require('@material-tailwind/react/utils/withMT')
const config: Config = withMT({
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // fontFamily: {
      //   display: 'Roboto, sans-serif',
      //   heading: '"Orbitron", sans-serif',
      // },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        secondary: {
          DEFAULT: '#2F3349',
          50: '#535D81',
          100: '#4F587B',
          200: '#474F6E',
          300: '#3F4562',
          400: '#373C55',
          500: '#2F3349',
          600: '#272A3D',
          700: '#1F2130',
          800: '#171824',
          900: '#0F1017',
          950: '#0B0C11',
        },
        'medium-purple': {
          DEFAULT: '#9657D6',
          50: '#E3C6F1',
          100: '#DCB9EE',
          200: '#CDA1E8',
          300: '#BD88E2',
          400: '#AA6FDC',
          500: '#9657D6',
          600: '#7932CD',
          700: '#5E29A8',
          800: '#452083',
          900: '#2F175E',
          950: '#24124C',
        },
        purple: {
          DEFAULT: '#9657D6',
          50: '#E3C6F1',
          100: '#DCB9EE',
          200: '#CDA1E8',
          300: '#BD88E2',
          400: '#AA6FDC',
          500: '#9657D6',
          600: '#7932CD',
          700: '#5E29A8',
          800: '#452083',
          900: '#2F175E',
          950: '#24124C',
        },
      },
    },
  },
  plugins: [],
})
export default config
