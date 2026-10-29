import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }) => {
  // Hanya gunakan root: 'example' saat 'vite' (dev server serve), bukan saat vitest
  const isDevServer = command === 'serve' && !process.env.VITEST;

  return {
    root: isDevServer ? 'example' : resolve(__dirname),
    server: {
      port: 1520,
      open: false,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'BookCanvas',
        fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
        formats: ['es', 'cjs'],
      },
      sourcemap: true,
      rollupOptions: {
        external: [],
      },
    },
    plugins: [
      dts({
        rollupTypes: true,
      }),
    ],
    // @ts-expect-error vitest config
    test: {
      root: resolve(__dirname),
      include: ['tests/**/*.test.ts'],
    },
  };
});
