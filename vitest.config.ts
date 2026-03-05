import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
    setupFiles: ['tests/integration/setup.ts'],
    env: {
      JWT_SECRET: 'test-secret-do-not-use-in-production',
    },
  },
});
