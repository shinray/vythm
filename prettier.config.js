const config = {
    singleQuote: true,
    trailingComma: 'all',
    arrowParens: 'always',
    printWidth: 80,
    proseWrap: 'always',
    tabWidth: 4,
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            options: {
                singleQuote: true,
                // ... other TypeScript-specific options
            },
        },
    ],
};

module.exports = config;
