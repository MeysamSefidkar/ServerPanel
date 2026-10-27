import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath, URL} from 'node:url';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        // به‌جای ../../../ می‌نویسیم @/shared/...
        alias: {'@': fileURLToPath(new URL('./src', import.meta.url))},
    },
    server: {
        port: 5173,
        // وقتی backend آماده شد، درخواست‌های /api به آن فرستاده می‌شوند
        proxy: {'/api': {target: 'http://localhost:5000', changeOrigin: true}},
    },
});
