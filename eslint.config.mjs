import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'coverage/**'] },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: { ...globals.browser, Pong: 'readonly' }
    }
  },
  {
    files: ['tests/**/*.cjs'],
    languageOptions: { globals: globals.node }
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    rules: {
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { caughtErrors: 'all', caughtErrorsIgnorePattern: '^_' }]
    }
  }
];
