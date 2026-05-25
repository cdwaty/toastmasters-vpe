/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#6B1A2A',
          dark: '#4A1020',
          light: '#8C2A3E',
          tint: '#FDF5F6',
        },
        gold: {
          DEFAULT: '#C9973A',
          light: '#E8B85A',
        },
        cream: {
          DEFAULT: '#FAF7F2',
          dark: '#F0EBE1',
        },
        ink: {
          DEFAULT: '#1C1410',
          mid: '#4A3D35',
          light: '#8A7B70',
        },
        success: { DEFAULT: '#2D6A4F', light: '#EAF4EE' },
        info: { DEFAULT: '#2855A8', light: '#EFF4FD' },
        accent: { DEFAULT: '#6B3FA0', light: '#F3EEF8' },
        danger: { DEFAULT: '#C0392B', light: '#FDF0F0' },
        warning: { DEFAULT: '#A0620A', light: '#FFF5E6' },
        line: '#DDD5C8',
        rowhover: '#FDF8F5',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(107, 26, 42, 0.08)',
        pop: '0 8px 32px rgba(107, 26, 42, 0.14)',
        topbar: '0 2px 16px rgba(0,0,0,0.25)',
        focus: '0 0 0 3px rgba(107, 26, 42, 0.1)',
      },
      screens: {
        md: '900px',
      },
      maxWidth: {
        content: '1200px',
      },
      letterSpacing: {
        label: '0.04em',
        eyebrow: '0.08em',
        caps: '0.12em',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        pop: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          from: { transform: 'translateX(40px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease',
        pop: 'pop 0.18s ease',
        slideIn: 'slideIn 0.25s ease',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
