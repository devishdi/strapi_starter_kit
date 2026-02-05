import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    files: [
        'src/api/content/**/*.ts',
        'src/api/strapi-corp/**/*.ts',
        'src/types/custom/*.ts',
    ],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    rules: {
        'no-empty-function': 'off',
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-extra-non-null-assertion': 'error',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'import',
                format: ['camelCase', 'PascalCase'],
            },
            {
                selector: 'enum',
                format: ['UPPER_CASE'],
            },
            {
                selector: ['variable'],
                format: ['strictCamelCase', 'UPPER_CASE'],
            },
            {
                selector: 'class',
                format: ['PascalCase'],
            },
            {
                selector: [
                    'parameter',
                    'interface',
                    'function',
                    'classMethod',
                    'classProperty',
                    'typeAlias',
                ],
                format: ['strictCamelCase'],
            },
        ],
    },
});
