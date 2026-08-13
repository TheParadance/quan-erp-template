import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import metadata from '../module.metadata.json'
import externals from '@quan-erp/shared-frontend-core/external-global-rollup-config.json' with { type: 'json' }
import quanERPCssPlugin from '@quan-erp/vite-css-plugins';
import autoprefixer from 'autoprefixer'
import safeParser from 'postcss-safe-parser';





const MODE = process.env.MODE

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      optimize: {
        minify: MODE === 'dev' ? false : true
      }
    }),
  ],
  css: {
    postcss: {
      parser: safeParser,
      plugins: [
        autoprefixer(),
        quanERPCssPlugin(metadata, {
          ignoreFiles: ['test.css']
        }),
      ],
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    sourcemap: MODE === 'dev',
    minify: MODE === 'dev' ? false : 'terser',
    terserOptions: MODE === 'dev' ? undefined : {
      format: { comments: false },
      compress: { drop_console: true }
    },
    cssCodeSplit: false,
    lib: {
      entry: 'src/index.tsx',                // your module entry
      formats: ['es']
    },
    rollupOptions: {
      external: Object.keys(externals),
      output: {
        format: "es",
        preserveModules: MODE === 'dev',
        preserveModulesRoot: "src",
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.facadeModuleId && chunkInfo.facadeModuleId.endsWith('src/index.tsx')) {
            return 'module.js';
          }
          return MODE === 'dev' ? '[name].js' : '[hash].js';
        },
        chunkFileNames: MODE === 'dev' ? '[name].js' : '[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css'; // <--- rename CSS
          }
          return MODE === 'dev' ? '[name][extname]' : '[hash][extname]';
        },
      },
    },
    outDir: `./dist`,
  },
});