'use strict';

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: ['ember'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
  },
  rules: {},
  overrides: [
    // node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
        './addon-main.js',
        './blueprints/*/index.js',
        './blueprints/test-framework-detector.js',
        './config/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
    },
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        // allows eslint from any dir
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      plugins: ['@typescript-eslint', 'ember'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      rules: {
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: true,
            allowHigherOrderFunctions: true,
          },
        ],
      },
    },
    {
      // test files
      files: ['tests/**/*-test.{js,ts}'],
      extends: ['plugin:qunit/recommended'],
    },
  ],
};
