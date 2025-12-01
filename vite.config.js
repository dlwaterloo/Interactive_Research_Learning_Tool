import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/serpapi': {
          target: 'https://serpapi.com',
          changeOrigin: true,
          rewrite: (path) => {
            // Extract query parameter from path
            const url = new URL(path, 'http://localhost:5173');
            const query = url.searchParams.get('q');
            const apiKey = env.VITE_SERPAPI_KEY || '';
            
            if (!apiKey) {
              console.error('VITE_SERPAPI_KEY is not set in .env file');
            }
            
            if (query) {
              return `/search.json?engine=google_scholar&q=${encodeURIComponent(query)}&api_key=${apiKey}`;
            }
            return '/search.json';
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
          },
        },
      },
    },
  }
})

