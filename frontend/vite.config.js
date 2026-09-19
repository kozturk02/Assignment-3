import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.BACKEND_PORT': JSON.stringify(env.BACKEND_PORT || '3001'),
      'import.meta.env.FRONTEND_PORT': JSON.stringify(env.FRONTEND_PORT || '5173'),
      'import.meta.env.HOST_ADDRESS': JSON.stringify(env.HOST_ADDRESS || 'localhost')
    }
  };
});