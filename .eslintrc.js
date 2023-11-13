module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
    },
    extends: [
        // "eslint:recommended",
        'airbnb-base',
        'prettier',
    ],
    plugins: ['prettier'],
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
        quotes: ['error', 'single'],
    },
};
