// KathApp — shared flat ESLint config for all workspaces.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.d.ts',
      'apps/api/prisma/migrations/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      // Contract-v1 DTOs are structural; unused args prefixed with _ are intentional.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      eqeqeq: ['error', 'smart'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  {
    files: ['apps/api/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      // NestJS resolves constructor dependencies from the `design:paramtypes`
      // metadata that TypeScript emits for decorated classes. An `import type`
      // is erased before that metadata is written, so the injected class
      // degrades to a bare `Function` and DI fails at runtime. Verified by
      // diffing the emitted dist output. Keep value imports in the API.
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },

  {
    files: ['apps/web/**/*.{ts,tsx}'],
    ...reactHooks.configs['recommended-latest'],
    languageOptions: {
      globals: globals.browser,
    },
  },

  {
    files: ['**/*.config.{ts,mts,js,mjs}', 'apps/web/*.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  {
    // Repository-Werkzeuge. Sie laufen im Terminal, also ist Ausgabe auf die
    // Konsole hier kein Versehen, sondern ihr Zweck.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
    },
  },
);
