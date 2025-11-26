export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
            '3xl': '1780px',  // XL mode starts here
        },
        extend: {
            maxWidth: {
                'default': '1440px',      // Default max-width
                'xl-mode': '1920px',      // XL mode max-width
                'container': '1440px',    // Container default
                'container-xl': '1920px', // Container XL mode
            },
            colors: {
                // Core Brand Colors (can be used in public pages)
                'brand-primary': 'rgb(var(--color-brand-primary-rgb) / <alpha-value>)',
                'brand-secondary': '#6E6E73',
                'brand-dark': '#1D1D1F',
                'brand-background': '#F9F9F9',

                // New Design Tokens
                'bg-base': 'var(--color-bg-base)',
                'bg-gradient-start': 'var(--color-bg-gradient-start)',
                'surface': 'var(--color-surface)',
                'surface-2': 'var(--color-surface-2)',
                'text-primary': 'var(--color-text-primary)',
                'text-muted': 'var(--color-text-muted)',
                'accent': '#007AFF', // Apple Blue
                'accent-2': '#00BFA6',
                'danger': '#FF3B30',
                'success': '#34C759',
                'glass-border': 'var(--color-glass-border)',

                // macOS Style Palette
                'neutral-100': 'var(--color-neutral-100)',
                'neutral-200': '#E5E5E7',
                'neutral-300': '#D1D1D6',
                'neutral-400': '#A0A0A5',
                'neutral-500': '#8E8E93',
                'neutral-600': '#6E6E73',
                'neutral-700': '#48484A',
                'neutral-800': 'var(--color-neutral-800)',
            },
            fontFamily: {
                'sans': ['"Inter"', 'sans-serif'],
            },
            borderRadius: {
                'sm': '8px',
                'md': '12px',
                'lg': '20px',
                'xl': '28px',
                '2xl': '24px',
                '3xl': '32px',
            },
            boxShadow: {
                'card': '0 8px 32px rgba(18, 22, 26, 0.05)',
                'popover': '0 12px 48px rgba(20, 24, 26, 0.1)',
                'accent-glow': "0 0 20px 0 theme('colors.accent/30')",
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                'apple-md': '0 4px 24px rgba(0, 0, 0, 0.06)',
                'apple-lg': '0 10px 30px rgba(0, 0, 0, 0.08)',
            },
            transitionTimingFunction: {
                'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            keyframes: {
                'fade-in-up': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(10px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    },
                },
                'marquee': {
                    '0%': {
                        transform: 'translateX(0%)'
                    },
                    '100%': {
                        transform: 'translateX(-50%)'
                    },
                }
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
                'marquee': 'marquee 15s linear infinite',
            },
        },
    },
    plugins: [],
}
