/**
 * @type {import("eslint").Linter.Config}
 */
const config = {
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 11,
		project: './tsconfig.json',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	root: true,
	rules: {
		/* base prettier rule */
		'prettier/prettier': 'error',

		'max-len': 'off',
		'no-console': 'warn',
		'no-param-reassign': 'off',
		'object-curly-newline': 'off',
		'no-underscore-dangle': ['off'],
		'arrow-body-style': ['warn'],
		'eol-last': ['warn'],
		'no-unreachable': ['warn'],
		'no-continue': 'off',

		/* typescript-eslint overwritten rules */
		'no-use-before-define': 'off',
		'no-unused-vars': 'off',
		'no-loss-of-precision': 'off',
		'no-shadow': 'off',
		'no-empty-function': 'off',

		/* typescript-eslint rules */
		'@typescript-eslint/no-empty-function': 'error',
		'@typescript-eslint/no-use-before-define': 'error',
		'@typescript-eslint/no-unused-vars': 'warn',
		'@typescript-eslint/no-loss-of-precision': 'error',
		'@typescript-eslint/no-redundant-type-constituents': 'error',
		'@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
		'@typescript-eslint/no-shadow': 'off',
		'@typescript-eslint/dot-notation': 'off',
		'@typescript-eslint/naming-convention': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
	},
};

module.exports = config;
