import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['client/src/**/*.{test,spec}.{ts,tsx}', 'server/src/**/*.{test,spec}.ts'],
  },
});
