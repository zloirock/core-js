module.exports = {
  env: {
    browser: true,
    node: true,
  },
  rules: {
    // best practices:
    // encourages use of dot notation whenever possible
    'dot-notation': ['error', { allowKeywords: false }],

    // variables:
    // disallow declaration of variables that are not used in the code
    'no-unused-vars': ['error', { vars: 'local', args: 'after-used', ignoreRestSiblings: true }],

    // stylistic issues:
    // enforce one true brace style
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    // require camel case names
    camelcase: ['error', { properties: 'never' }],
    // this option sets a specific tab width for your code
    indent: ['error', 2, { VariableDeclarator: 2, SwitchCase: 1 }],
    // specify the maximum length of a line in your program
    'max-len': ['error', 120, 2],
    // enforce a maximum depth that callbacks can be nested
    'max-nested-callbacks': ['error', 4],
    // require a capital letter for constructors
    'new-cap': ['error', { newIsCap: true, capIsNew: false }],
    // disallow multiple empty lines and only one newline at the end
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    // specify whether double or single quotes should be used
    quotes: ['error', 'single', 'avoid-escape'],
    // require or disallow use of quotes around object literal property names
    'quote-props': ['error', 'as-needed', { keywords: true }],
  }
};
