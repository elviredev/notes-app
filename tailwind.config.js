/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'bg-pattern': "url('./src/assets/images/liquid-cheese.png')"
      }
    },
    fontFamily: {
      Poppins: ['Poppins, sans-serif']
    },
    container: {
      center: true,
      screens: {
        lg: '1124px',
        xl: '1124px',
        '2xl': '1124px'
      }
    }
  },
  plugins: []
}
