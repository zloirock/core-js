/* eslint comma-dangle: ['error', 'always-multiline'] */
module.exports = {
  parserOptions: {
    ecmaVersion: 3,
  },
  env: {
    browser: true,
    node: true,
  },
  plugins: ['import'],
  rules: {
    // possible errors:
    // enforce 'for' loop update clause moving the counter in the right direction
    'for-direction': 'error',
    // disallow window alert / confirm / prompt calls
    'no-alert': 'error',
    // disallow comparing against -0
    'no-compare-neg-zero': 'error',
    // disallow use of console
    'no-console': 'error',
    // disallow constant expressions in conditions
    'no-constant-condition': ['error', { checkLoops: false }],
    // disallow control characters in regular expressions
    'no-control-regex': 'error',
    // disallow use of debugger
    'no-debugger': 'error',
    // disallow duplicate arguments in functions
    'no-dupe-args': 'error',
    // disallow duplicate keys when creating object literals
    'no-dupe-keys': 'error',
    // disallow a duplicate case label.
    'no-duplicate-case': 'error',
    // disallow else after a return in an if
    'no-else-return': 'error',
    // disallow empty statements
    'no-empty': 'error',
    // disallow the use of empty character classes in regular expressions
    'no-empty-character-class': 'error',
    // disallow unnecessary boolean casts
    'no-extra-boolean-cast': 'error',
    // disallow unnecessary semicolons
    'no-extra-semi': 'error',
    // disallow assigning to the exception in a catch block
    'no-ex-assign': 'error',
    // disallow overwriting functions written as function declarations
    'no-func-assign': 'error',
    // disallow function or variable declarations in nested blocks
    'no-inner-declarations': 'error',
    // disallow invalid regular expression strings in the RegExp constructor
    'no-invalid-regexp': 'error',
    // disallow irregular whitespace outside of strings and comments
    'no-irregular-whitespace': 'error',
    // disallow the use of object properties of the global object (Math and JSON) as functions
    'no-obj-calls': 'error',
    // disallow use of Object.prototypes builtins directly
    'no-prototype-builtins': 'error',
    // disallow multiple spaces in a regular expression literal
    'no-regex-spaces': 'error',
    // disallow sparse arrays
    'no-sparse-arrays': 'error',
    // disallow template literal placeholder syntax in regular strings
    'no-template-curly-in-string': 'error',
    // avoid code that looks like two expressions but is actually one
    'no-unexpected-multiline': 'error',
    // disallow negation of the left operand of an in expression
    'no-unsafe-negation': 'error',
    // disallow comparisons with the value NaN
    'use-isnan': 'error',
    // disallow unreachable statements after a return, throw, continue, or break statement
    'no-unreachable': 'error',
    // ensure that the results of typeof are compared against a valid string
    'valid-typeof': 'error',

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
    // disallow use of multiple spaces
    'no-multi-spaces': ['error', { ignoreEOLComments: true }],
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
    // disallow declaring the same variable more then once
    'no-redeclare': 'error',
    // disallow unnecessary calls to `.call()` and `.apply()`
    'no-useless-call': 'error',
    // disallow redundant return statements
    'no-useless-return': 'error',
    // disallow use of `javascript:` urls.
    'no-script-url': 'error',
    // disallow self assignment
    'no-self-assign': 'error',
    // disallow comparisons where both sides are exactly the same
    'no-self-compare': 'error',
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
    // enforce spacing inside array brackets
    'array-bracket-spacing': ['error', 'never'],
    // enforce spacing inside single-line blocks
    'block-spacing': ['error', 'always'],
    // enforce one true brace style
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    // require camel case names
    camelcase: ['error', { properties: 'never' }],
    // disallow trailing commas in multiline object literals
    'comma-dangle': ['error', 'never'],
    // enforce spacing after comma
    'comma-spacing': 'error',
    // enforce one true comma style
    'comma-style': ['error', 'last', { exceptions: { VariableDeclaration: true } }],
    // disallow padding inside computed properties
    'computed-property-spacing': ['error', 'never'],
    // enforce one newline at the end of files
    'eol-last': ['error', 'always'],
    // disallow space between function identifier and application
    'func-call-spacing': 'error',
    // this option sets a specific tab width for your code
    'indent-legacy': ['error', 2, { VariableDeclarator: 2, SwitchCase: 1 }],
    // require a space before & after certain keywords
    'keyword-spacing': ['error', { before: true, after: true }],
    // enforces spacing between keys and values in object literal properties
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    // enforce consistent linebreak style
    'linebreak-style': ['error', 'unix'],
    // specify the maximum length of a line in your program
    'max-len': ['error', 120, 2],
    // enforce a maximum depth that callbacks can be nested
    'max-nested-callbacks': ['error', 4],
    // specify the maximum number of statement allowed in a function
    'max-statements': ['error', 40],
    // require a capital letter for constructors
    'new-cap': ['error', { newIsCap: true, capIsNew: false }],
    // require parentheses when invoking a constructor with no arguments
    'new-parens': 'error',
    // disallow if as the only statement in an else block
    'no-lonely-if': 'error',
    // disallow mixed spaces and tabs for indentation
    'no-mixed-spaces-and-tabs': 'error',
    // disallow multiple empty lines and only one newline at the end
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    // disallow tabs
    'no-tabs': 'error',
    // disallow trailing whitespace at the end of lines
    'no-trailing-spaces': 'error',
    // disallow the use of boolean literals in conditional expressions and prefer `a || b` over `a ? a : b`
    'no-unneeded-ternary': ['error', { defaultAssignment: false }],
    // disallow whitespace before properties
    'no-whitespace-before-property': 'error',
    // enforce the location of single-line statements
    'nonblock-statement-body-position': ['error', 'beside'],
    // enforce spaces inside braces
    'object-curly-spacing': ['error', 'always'],
    // require newlines around variable declarations with initializations
    'one-var-declaration-per-line': ['error', 'initializations'],
    // enforce padding within blocks
    'padded-blocks': ['error', 'never'],
    // specify whether double or single quotes should be used
    quotes: ['error', 'single', 'avoid-escape'],
    // require or disallow use of quotes around object literal property names
    'quote-props': ['error', 'as-needed', { keywords: true }],
    // require or disallow use of semicolons instead of ASI
    semi: ['error', 'always'],
    // enforce spacing before and after semicolons
    'semi-spacing': 'error',
    // enforce location of semicolons
    'semi-style': ['error', 'last'],
    // require or disallow space before blocks
    'space-before-blocks': 'error',
    // require or disallow space before function opening parenthesis
    'space-before-function-paren': ['error', { anonymous: 'always', named: 'never' }],
    // require or disallow spaces inside parentheses
    'space-in-parens': 'error',
    // require spaces around operators
    'space-infix-ops': 'error',
    // Require or disallow spaces before/after unary operators
    'space-unary-ops': 'error',
    // require or disallow a space immediately following the // or /* in a comment
    'spaced-comment': ['error', 'always', { line: { exceptions: ['/'] }, block: { exceptions: ['*'] } }],
    // enforce spacing around colons of switch statements
    'switch-colon-spacing': 'error',
    // require or disallow the Unicode Byte Order Mark
    'unicode-bom': ['error', 'never'],

    // commonjs:
    // disallow new operators with calls to require
    'no-new-require': 'error',
    // disallow string concatenation with `__dirname` and `__filename`
    'no-path-concat': 'error',

    // import:
    // forbid AMD imports
    'import/no-amd': 'error',
    // ensure imports point to files / modules that can be resolved
    'import/no-unresolved': ['error', { commonjs: true }],
    // forbid import of modules using absolute paths
    'import/no-absolute-path': 'error',
    // forbid `require()` calls with expressions
    'import/no-dynamic-require': 'error',
    // disallow importing from the same path more than once
    'import/no-duplicates': 'error',
  },
};
