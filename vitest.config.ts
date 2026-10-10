import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['client/src/**/*.{test,spec}.{ts,tsx}', 'server/src/**/*.{test,spec}.ts'],
    setupFiles: ['client/src/testSetup.ts'],
  },
});
