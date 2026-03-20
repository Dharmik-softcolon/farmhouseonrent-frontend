import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './src/assets'),
        },
    },

    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },

    build: {
        outDir: 'dist',
        sourcemap: false,
        // Inline limit 0 = no base64 inlining, better caching
        assetsInlineLimit: 0,
        // Chunk splitting for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    // Separate vendor chunk — cached separately
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    // Separate UI utilities
                    ui: ['react-icons', 'react-hot-toast', 'react-helmet-async'],
                },
                // Ensure hashed filenames for cache busting
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
            },
        },
        // Minify for production
        minify: 'esbuild',
        // Target modern browsers (better tree-shaking)
        target: 'es2020',
    },

    assetsInclude: [
        '**/*.jpg', '**/*.jpeg', '**/*.png',
        '**/*.svg', '**/*.gif', '**/*.webp'
    ],
});