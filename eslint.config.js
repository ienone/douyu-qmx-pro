import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts}'],
        plugins: { js, ts },
        extends: ['js/recommended', 'ts/recommended'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'es2022',
                sourceType: 'module',
                project: ['./tsconfig.json'],
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2022,
                ...globals.greasemonkey,
            },
        },
    },
    globalIgnores(['**/dist/**', '**/node_modules/**', '**/.git/**']),
]);
