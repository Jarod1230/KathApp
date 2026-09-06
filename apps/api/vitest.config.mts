import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    // Integration tests share one Postgres schema and truncate between cases,
    // so two files running at once would wipe each other's fixtures.
    fileParallelism: false,
  },
});
