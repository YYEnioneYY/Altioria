import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {
  defineConfig,
  loadEnv,
} from 'vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, '.', '');

  const apiProxyTarget = env.API_PROXY_TARGET;

  if (command === 'serve' && !apiProxyTarget) {
    throw new Error(
      'API_PROXY_TARGET is not specified in frontend .env',
    );
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],

    server:
      command === 'serve'
        ? {
            proxy: {
              '/api': {
                target: apiProxyTarget,
                changeOrigin: true,
              },
            },
          }
        : undefined,
  };
});