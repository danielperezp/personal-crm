import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './src/__tests__/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
    alias: {
      '@nexus/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  resolve: {
    alias: {
      '@nexus/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
});
