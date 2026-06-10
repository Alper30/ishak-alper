import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Raise warning limit slightly; real win comes from manual chunking below.
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          // Split heavy third-party libraries into separate, cacheable chunks
          // so the browser can load them in parallel and cache them across deploys.
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('@firebase') || id.includes('/firebase/')) return 'vendor-firebase';
              if (id.includes('framer-motion') || id.includes('/motion/') || id.includes('/motion-dom/')) return 'vendor-motion';
              if (id.includes('react-router')) return 'vendor-router';
              if (
                id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') ||
                id.includes('micromark') || id.includes('mdast') || id.includes('hast') ||
                id.includes('unified') || id.includes('property-information') ||
                id.includes('dompurify') || id.includes('vfile') || id.includes('unist')
              ) return 'vendor-markdown';
              if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n';
              if (id.includes('embla-carousel')) return 'vendor-carousel';
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('date-fns')) return 'vendor-datefns';
              if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) return 'vendor-react';
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
