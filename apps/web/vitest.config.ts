import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // jsdom so tests can exercise the browser storage the api client uses.
    environment: 'jsdom',
    include: ['test/**/*.spec.ts', 'test/**/*.spec.tsx'],
  },
});
