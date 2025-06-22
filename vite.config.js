import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import terser from '@rollup/plugin-terser';
import fs from 'fs';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'LeafletSigpac',
      fileName: (format) => `assets/js/leaflet-sigpac.${format}.min.js`
    },
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      external: ['leaflet'],
      output: {
        globals: {
          leaflet: 'L'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'assets/css/leaflet-sigpac.min.css';
          }
          return 'assets/[name][extname]';
        }
      },
      plugins: [terser()]
    }
  },
  
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          config: path.resolve(__dirname, 'tailwind.config.js')
        }),
        autoprefixer()
      ]
    },
    devSourcemap: false
  },
  
  server: {
    port: 5173,
    open: '/examples/basic.html',
    host: true,
    fs: {
      strict: false,
      allow: ['.']
    }
  },
  
  root: path.resolve(__dirname, './'),
  publicDir: 'public',
  
  plugins: [
    {
      name: 'serve-examples',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            // Servir archivos de ejemplos
            if (req.url.startsWith('/examples/')) {
              const filePath = path.join(__dirname, 'public', req.url);
              if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
                return;
              }
            }
            
            // Servir assets desde dist
            if (req.url.startsWith('/assets/')) {
              const filePath = path.join(__dirname, 'dist', req.url);
              if (fs.existsSync(filePath)) {
                const ext = path.extname(filePath);
                const type = ext === '.css' ? 'text/css' : 
                            ext === '.js' ? 'application/javascript' : 
                            'text/plain';
                
                res.writeHead(200, { 'Content-Type': type });
                res.end(fs.readFileSync(filePath));
                return;
              }
            }
            
            next();
          });
        };
      }
    }
  ]
});