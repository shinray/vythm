module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    extends: [
        'eslint:recommended',
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    plugins: ['@typescript-eslint', 'prettier'],
    overrides: [
        {
            extends: [
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
            ],
            files: ['./**/*.{ts,tsx}'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module',
                project: './tsconfig.json',
            },
            // TypeScript-specific rules
        },
        {
            files: ['*.js'],
            // JavaScript-specific rules
        },
    ],
    env: {
        node: true,
        es6: true,
    },
    rules: {
        // "accessor-pairs": 'off',
        // 'array-callback-return': ['error', { allowImplicit: true }],
        // 'block-scoped-var': 'error',
        // complexity: ['off', 11],

        // 'class-methods-use-this': [
        // 	'error',
        // 	{
        // 		exceptMethods: [],
        // 	},
        // ],
        // 'consistent-return': 'error',
        // curly: ['error', 'multi-line'],
        // 'default-case': ['error', { commentPattern: '^no defaults' }],
        // 'default-param-last': 'off',
        // 'dot-notation': ['error', { allowKeywords: true }],
        // 'dot-location': ['error', 'property'],
        // eqeqeq: ['error', 'always', { null: 'ignore' }],
        'no-console': 'off',
        'prettier/prettier': ['error'],
        // 'import/extensions': [
        //     'error',
        //     'ignorePackages',
        //     {
        //         js: 'never',
        //         ts: 'never',
        //         tsx: 'never',
        //     },
        // ],
        'import/extensions': 'off',
        'import/no-unresolved': 'off', // Disable this rule as TypeScript will handle it
        'import/prefer-default-export': 'off', // Allowing single exports for simplicity
        '@typescript-eslint/explicit-module-boundary-types': 'off', // Allowing implicit return types for simplicity
        quotes: ['error', 'single', { avoidEscape: true }],
        'no-shadow': 'off', // https://stackoverflow.com/questions/63961803/eslint-says-all-enums-in-typescript-app-are-already-declared-in-the-upper-scope
        camelcase: 'off',
        'no-underscore-dangle': ['error', { allowAfterThis: true }],
    },
};
