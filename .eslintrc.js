module.exports = {
  parserOptions: {
    ecmaVersion: 3,
  },
  env: {
    browser: true,
    node: true,
  },
  rules: {
    // best practices:
    // enforces return statements in callbacks of array's methods
    'array-callback-return': 'error',
    // encourages use of dot notation whenever possible
    'dot-notation': ['error', { allowKeywords: false }],
    // enforce newline before and after dot
    'dot-location': ['error', 'property'],
    // disallow use of arguments.caller or arguments.callee
    'no-caller': 'error',
    // disallow lexical declarations in case/default clauses
    'no-case-declarations': 'error',
    // disallow empty functions, except for standalone funcs/arrows
    'no-empty-function': 'error',
    // disallow empty destructuring patterns
    'no-empty-pattern': 'error',
    // disallow use of eval()
    'no-eval': 'error',
    // disallow adding to native types
    'no-extend-native': 'error',
    // disallow unnecessary function binding
    'no-extra-bind': 'error',
    // disallow unnecessary labels
    'no-extra-label': 'error',
    // disallow fallthrough of case statements
    'no-fallthrough': 'error',
    // disallow the use of leading or trailing decimal points in numeric literals
    'no-floating-decimal': 'error',
    // disallow reassignments of native objects
    'no-global-assign': 'error',
    // disallow use of eval()-like methods
    'no-implied-eval': 'error',
    // disallow usage of __iterator__ property
    'no-iterator': 'error',
    // disallow use of labels for anything other then loops and switches
    'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
    // disallow unnecessary nested blocks
    'no-lone-blocks': 'error',
    // disallow function declarations and expressions inside loop statements
    'no-loop-func': 'error',
    // disallow use of multiline strings
    'no-multi-str': 'error',
    // disallow use of new operator when not part of the assignment or comparison
    'no-new': 'error',
    // disallow use of new operator for Function object
    'no-new-func': 'error',
    // disallows creating new instances of String, Number, and Boolean
    'no-new-wrappers': 'error',
    // disallow use of (old style) octal literals
    'no-octal': 'error',
    // disallow use of octal escape sequences in string literals, such as var foo = 'Copyright \251';
    'no-octal-escape': 'error',
    // disallow usage of __proto__ property
    'no-proto': 'error',
    // disallow redundant return statements
    'no-useless-return': 'error',
    // disallow use of `javascript:` urls.
    'no-script-url': 'error',
    // disallow self assignment
    'no-self-assign': 'error',
    // disallow use of comma operator
    'no-sequences': 'error',
    // restrict what can be thrown as an exception
    'no-throw-literal': 'error',
    // disallow usage of expressions in statement position
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    // disallow unused labels
    'no-unused-labels': 'error',
    // disallow useless string concatenation
    'no-useless-concat': 'error',
    // disallow unnecessary string escaping
    'no-useless-escape': 'error',
    // disallow void operators
    'no-void': 'error',
    // disallow use of the with statement
    'no-with': 'error',
    // require use of the second argument for parseInt()
    radix: 'error',

    // variables:
    // disallow catch clause parameters from shadowing variables in the outer scope
    'no-catch-shadow': 'error',
    // disallow deletion of variables
    'no-delete-var': 'error',
    // disallow labels that share a name with a variable
    'no-label-var': 'error',
    // disallow declaration of variables already declared in the outer scope
    'no-shadow': 'error',
    // disallow shadowing of names such as arguments
    'no-shadow-restricted-names': 'error',
    // disallow use of undeclared variables unless mentioned in a /*global */ block
    'no-undef': ['error'],
    // disallow initializing variables to undefined
    'no-undef-init': 'error',
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
