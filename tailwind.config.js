export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '2rem' },
      screens: { xl: '1344px' },
    },
    extend: {
      colors: { cobalt: '#2853d9' },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Iowan Old Style', 'Palatino Linotype', 'Georgia', 'serif'],
      },
      keyframes: { appear: { from: { opacity: '.4' }, to: { opacity: '1' } } },
      animation: { appear: 'appear 140ms ease-out' },
    },
  },
}
