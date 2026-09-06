import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // NestJS resolves constructor dependencies from the decorator metadata
  // TypeScript emits. Vitest transforms with esbuild, which does not emit it,
  // so DI would fail for anything booted through the Nest container. SWC does.
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    // Integration tests share one Postgres schema and truncate between cases,
    // so two files running at once would wipe each other's fixtures.
    fileParallelism: false,
  },
});
