import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    darkMode: 'class',

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif', ...defaultTheme.fontFamily.sans],
                heading: ['Poppins', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                brand: ['"Playfair Display"', 'serif'],
            },
            colors: {
                navy: {
                    DEFAULT: '#12355B',
                    dark: '#0d2847',
                    light: '#1e4b7a',
                },
                brand: {
                    DEFAULT: '#2563EB',
                    dark: '#1D4ED8',
                    light: '#EFF6FF',
                },
                status: {
                    info: '#0891B2',
                    warning: '#D97706',
                    danger: '#DC2626',
                    success: '#15803D',
                },
            },
        },
    },

    plugins: [forms],
};
