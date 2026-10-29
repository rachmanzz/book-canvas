import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(__dirname, 'example'),
  base: '/book-canvas/',
  build: {
    outDir: resolve(__dirname, 'dist-pages'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'example/index.html'),
        word: resolve(__dirname, 'example/word/index.html'),
        spreadsheet: resolve(__dirname, 'example/spreadsheet/index.html'),
        slides: resolve(__dirname, 'example/slides/index.html'),
        poster: resolve(__dirname, 'example/poster/index.html'),
        markdown: resolve(__dirname, 'example/markdown/index.html'),
        pdf: resolve(__dirname, 'example/pdf/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
