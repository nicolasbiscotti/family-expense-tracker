import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@services': resolve(__dirname, './src/services'),
        '@utils': resolve(__dirname, './src/utils'),
        '@types': resolve(__dirname, './src/types'),
      },
    },
    define: {
      // Make environment variables available
      'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || 'local'),
    },
    build: {
      target: 'ES2022',
      minify: 'terser',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            lit: ['lit'],
          },
        },
      },
    },
    server: {
      port: 5173,
      host: true,
    },
    preview: {
      port: 4173,
    },
  };
});
