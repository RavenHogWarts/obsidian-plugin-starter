import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
	js.configs.recommended,
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				sourceType: 'module',
				project: './tsconfig.json'
			},
			globals: globals.browser
		},
		plugins: {
			'@typescript-eslint': tseslint
		},
		rules: {
			...tseslint.configs.recommended.rules,
			// official rules
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
			'@typescript-eslint/ban-ts-comment': 'off',
			'no-prototype-builtins': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-explicit-any': 'off',

			// custom rules
			'@typescript-eslint/no-inferrable-types': 'off',
			'no-mixed-spaces-and-tabs': 'off',
			'sort-imports': [
				'error',
				{
					ignoreCase: true,
					ignoreDeclarationSort: true,
					ignoreMemberSort: false,
					memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single']
				}
			]
		}
	},
	{
		files: ['test/**/*.ts'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				sourceType: 'module',
				project: './tsconfig.json'
			},
			globals: {
				...globals.browser,
				...globals.jest
			}
		},
		plugins: {
			'@typescript-eslint': tseslint
		},
		rules: {
			...tseslint.configs.recommended.rules,
			// official rules
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
			'@typescript-eslint/ban-ts-comment': 'off',
			'no-prototype-builtins': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-explicit-any': 'off',

			// custom rules
			'@typescript-eslint/no-inferrable-types': 'off',
			'no-mixed-spaces-and-tabs': 'off',
			'sort-imports': [
				'error',
				{
					ignoreCase: true,
					ignoreDeclarationSort: true,
					ignoreMemberSort: false,
					memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single']
				}
			]
		}
	},
	{
		ignores: ['node_modules/**', 'main.js', 'scripts/**', '*.js']
	}
];