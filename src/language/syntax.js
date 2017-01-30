// This is a monarch language definition. See https://microsoft.github.io/monaco-editor/monarch.html

// Handwritten from https://github.com/redxdev/imquery/blob/master/IMQLang.g4
export default {
    keywords: [
        'func', 'delete', 'break', 'return', 'in', 'where', 'out', 'from', 'if', 'else',
        'for', 'while', 'do', 'loop'
    ],

    valueKeywords: [
        'nan', 'NaN', 'nil', 'true', 'false'
    ],

    wordOperators: [
        'and', 'or', 'not'
    ],

    operators: [
        '=>', '?', '=', '!', '>', '<', '+', '-', '*', '/', '%', ':'
    ],

    escapes: ['\\n', '\\r', '\\t'],

    symbols: /[=>?!<+\-*/%:]/,

    tokenizer: {
        root: [
            [/[a-zA-Z_][0-9a-zA-Z_]*/, {cases: {
                '@valueKeywords': 'keyword',
                '@keywords': 'keyword',
                '@wordOperators': 'operator',
                '@default': 'identifier'
            }}],

            {include: '@whitespace'},

            // brackets and operators
            [/[{}()\[\]<>]/, '@brackets'],
            [/@symbols/, {cases: {'@operators': 'operator', '@default': ''}}],

            // numbers
            [/\d '.' \d*/, 'number.float'],
            [/\d+/, 'number'],

            // delimiter
            [/[;,.]/, 'delimiter'],

            // strings
            [/"([^"\\]|\\.)*"/, 'string'],
            [/'([^'\\]|\\.)*'/, 'string'],
        ],

        whitespace: [
            [/[ \n\t\r]+/, 'white'],
            [/#.*$/, 'comment']
        ],
    },
};