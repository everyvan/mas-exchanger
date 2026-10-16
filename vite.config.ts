import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';
import { defineConfig, type Plugin } from 'vite';

dotenv.config();

function serverlessApiPlugin(): Plugin {
  return {
    name: 'serverless-api-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        try {
          if (pathname === '/api/health') {
            const mod = await server.ssrLoadModule('/api/health.ts');
            return await mod.default(req, res);
          }
          if (pathname === '/api/exchangerates') {
            const queryObj: Record<string, string> = {};
            url.searchParams.forEach((val, key) => {
              queryObj[key] = val;
            });
            (req as any).query = queryObj;
            const mod = await server.ssrLoadModule('/api/exchangerates.ts');
            return await mod.default(req, res);
          }
        } catch (err: any) {
          console.error('Serverless API Route Error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: err?.message || String(err) }));
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serverlessApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
