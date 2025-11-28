export default {
    tabWidth: 4,
    semi: false,
    printWidth: 100,
    singleQuote: true,
    arrowParens: 'avoid',
    vueIndentScriptAndStyle: true,
    plugins: [
        'prettier-plugin-tailwindcss',
        'prettier-plugin-organize-imports',
        'prettier-plugin-packagejson',
        '@shufo/prettier-plugin-blade',
    ],
    overrides: [
        {
            files: ['*.blade.php'],
            options: {
                parser: 'blade',
            },
        },
        {
            files: ['*.css'],
            options: {
                singleQuote: false,
            },
        },
    ],
}
