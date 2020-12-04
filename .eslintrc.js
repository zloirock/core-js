'use strict';
const RESTRICTED_GLOBALS = require('confusing-browser-globals');
const SUPPORTED_NODE_VERSIONS = require('core-js-builder/package').engines.node;
const DEV_NODE_VERSIONS = '^14.15';

function disable(rules) {
  return Object.keys(rules).reduce((memo, rule) => {
    memo[rule] = 'off';
    return memo;
  }, {});
}

const base = {
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
  // disallow invalid regular expression strings in the RegExp constructor
  'no-invalid-regexp': 'error',
  // disallow irregular whitespace outside of strings and comments
  'no-irregular-whitespace': 'error',
  // disallow literal numbers that lose precision
  // 'no-loss-of-precision': 'error', // TODO
  // disallow characters which are made with multiple code points in character class syntax
  'no-misleading-character-class': 'error',
  // disallow the use of object properties of the global object (Math and JSON) as functions
  'no-obj-calls': 'error',
  // disallow use of Object.prototypes builtins directly
  'no-prototype-builtins': 'error',
  // disallow multiple spaces in a regular expression literal
  'no-regex-spaces': 'error',
  // disallow specific global variables
  'no-restricted-globals': ['error', ...RESTRICTED_GLOBALS],
  // disallow returning values from setters
  'no-setter-return': 'error',
  // disallow sparse arrays
  'no-sparse-arrays': 'error',
  // disallow template literal placeholder syntax in regular strings
  'no-template-curly-in-string': 'error',
  // avoid code that looks like two expressions but is actually one
  'no-unexpected-multiline': 'error',
  // disallow negation of the left operand of an in expression
  'no-unsafe-negation': 'error',
  // disallow use of optional chaining in contexts where the `undefined` value is not allowed
  'no-unsafe-optional-chaining': 'error',
  // disallow loops with a body that allows only one iteration
  'no-unreachable-loop': 'error',
  // disallow useless backreferences in regular expressions
  'no-useless-backreference': 'error',
  // disallow comparisons with the value NaN
  'use-isnan': 'error',
  // disallow unreachable statements after a return, throw, continue, or break statement
  'no-unreachable': 'error',
  // ensure that the results of typeof are compared against a valid string
  'valid-typeof': 'error',

  // best practices:
  // enforces return statements in callbacks of array's methods
  'array-callback-return': 'error',
  // enforce default clauses in switch statements to be last
  'default-case-last': 'error',
  // encourages use of dot notation whenever possible
  'dot-notation': ['error', { allowKeywords: true }],
  // enforce newline before and after dot
  'dot-location': ['error', 'property'],
  // disallow use of arguments.caller or arguments.callee
  'no-caller': 'error',
  // disallow lexical declarations in case/default clauses
  'no-case-declarations': 'error',
  // disallow duplicate conditions in if-else-if chains
  'no-dupe-else-if': 'error',
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
  // disallow `\8` and `\9` escape sequences in string literals
  'no-nonoctal-decimal-escape': 'error',
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
  // disallow unnecessary catch clauses
  'no-useless-catch': 'error',
  // disallow useless string concatenation
  'no-useless-concat': 'error',
  // disallow unnecessary string escaping
  // 'no-useless-escape': 'error', // replaced by 'regexp/no-useless-escape'
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
  // enforce trailing commas in multiline object literals
  'comma-dangle': ['error', 'always-multiline'],
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
  // enforce consistent indentation
  indent: ['error', 2, {
    ignoredNodes: ['ConditionalExpression'],
    SwitchCase: 1,
    VariableDeclarator: 'first',
  }],
  // require a space before & after certain keywords
  'keyword-spacing': ['error', { before: true, after: true }],
  // enforces spacing between keys and values in object literal properties
  'key-spacing': ['error', { beforeColon: false, afterColon: true }],
  // enforce consistent linebreak style
  'linebreak-style': ['error', 'unix'],
  // specify the maximum length of a line in your program
  'max-len': ['error', { code: 120, tabWidth: 2 }],
  // enforce a maximum depth that callbacks can be nested
  'max-nested-callbacks': ['error', 4],
  // specify the maximum number of statement allowed in a function
  'max-statements': ['error', 40],
  // require a capital letter for constructors
  'new-cap': ['error', { newIsCap: true, capIsNew: false }],
  // require parentheses when invoking a constructor with no arguments
  'new-parens': 'error',
  // disallow `if` as the only statement in an `else` block
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
  // enforce consistent line breaks after opening and before closing braces
  'object-curly-newline': ['error', { consistent: true }],
  // enforce spaces inside braces
  'object-curly-spacing': ['error', 'always'],
  // require newlines around variable declarations with initializations
  'one-var-declaration-per-line': ['error', 'initializations'],
  // enforce padding within blocks
  'padded-blocks': ['error', 'never'],
  // specify whether double or single quotes should be used
  quotes: ['error', 'single', 'avoid-escape'],
  // require or disallow use of quotes around object literal property names
  'quote-props': ['error', 'as-needed', { keywords: false }],
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
  // require or disallow spaces before/after unary operators
  'space-unary-ops': 'error',
  // require or disallow a space immediately following the // or /* in a comment
  'spaced-comment': ['error', 'always', { line: { exceptions: ['/'] }, block: { exceptions: ['*'] } }],
  // enforce spacing around colons of switch statements
  'switch-colon-spacing': 'error',
  // require or disallow the Unicode Byte Order Mark
  'unicode-bom': ['error', 'never'],

  // import:
  // ensure all imports appear before other statements
  'import/first': 'error',
  // forbid AMD imports
  'import/no-amd': 'error',
  // forbid cycle dependencies
  'import/no-cycle': ['error', { commonjs: true }],
  // ensure imports point to files / modules that can be resolved
  'import/no-unresolved': ['error', { commonjs: true }],
  // forbid import of modules using absolute paths
  'import/no-absolute-path': 'error',
  // forbid `require()` calls with expressions
  'import/no-dynamic-require': 'error',
  // disallow importing from the same path more than once
  'import/no-duplicates': 'error',
  // forbid a module from importing itself
  'import/no-self-import': 'error',
  // forbid useless path segments
  'import/no-useless-path-segments': 'error',

  // node:
  // disallow deprecated APIs
  'node/no-deprecated-api': 'error',
  // require require() calls to be placed at top-level module scope
  'node/global-require': 'error',
  // disallow the assignment to `exports`
  'node/no-exports-assign': 'error',
  // disallow require calls to be mixed with regular variable declarations
  'node/no-mixed-requires': ['error', { grouping: true, allowCall: false }],
  // disallow new operators with calls to require
  'node/no-new-require': 'error',
  // disallow string concatenation with `__dirname` and `__filename`
  'node/no-path-concat': 'error',
  // disallow the use of `process.exit()`
  'node/no-process-exit': 'error',

  // es6+:
  // require parentheses around arrow function arguments
  'arrow-parens': ['error', 'as-needed'],
  // enforce consistent spacing before and after the arrow in arrow functions
  'arrow-spacing': 'error',
  // enforce the location of arrow function bodies
  'implicit-arrow-linebreak': ['error', 'beside'],
  // disallow unnecessary computed property keys in object literals
  'no-useless-computed-key': 'error',
  // disallow unnecessary constructors
  'no-useless-constructor': 'error',
  // require let or const instead of var
  'no-var': 'error',
  // disallow renaming import, export, and destructured assignments to the same name
  'no-useless-rename': 'error',
  // require or disallow method and property shorthand syntax for object literals
  'object-shorthand': 'error',
  // require using arrow functions for callbacks
  'prefer-arrow-callback': 'error',
  // require const declarations for variables that are never reassigned after declared
  'prefer-const': ['error', { destructuring: 'all' }],
  // require destructuring from arrays and/or objects
  'prefer-destructuring': 'error',
  // prefer the exponentiation operator over `Math.pow()`
  'prefer-exponentiation-operator': 'error',
  // require template literals instead of string concatenation
  'prefer-template': 'error',
  // disallow generator functions that do not have `yield`
  'require-yield': 'error',
  // enforce spacing between rest and spread operators and their expressions
  'rest-spread-spacing': 'error',
  // require or disallow spacing around embedded expressions of template strings
  'template-curly-spacing': ['error', 'always'],

  // require strict mode directives
  strict: ['error', 'global'],

  // unicorn
  // enforce a specific parameter name in catch clauses
  'unicorn/catch-error-name': ['error', { name: 'error', ignore: [/^err/] }],
  // enforce passing a message value when throwing a built-in error
  'unicorn/error-message': 'error',
  // require escape sequences to use uppercase values
  'unicorn/escape-case': 'error',
  // enforce a case style for filenames
  'unicorn/filename-case': ['error', { case: 'kebabCase' }],
  // enforce importing index files with `.`
  'unicorn/import-index': 'error',
  // enforce specifying rules to disable in eslint-disable comments
  'unicorn/no-abusive-eslint-disable': 'error',
  // enforce combining multiple `Array#push` into one call
  'unicorn/no-array-push-push': 'error',
  // do not use leading/trailing space between `console.log` parameters
  'unicorn/no-console-spaces': 'error',
  // enforce the use of unicode escapes instead of hexadecimal escapes
  'unicorn/no-hex-escape': 'error',
  // disallow `if` statements as the only statement in `if` blocks without `else`
  'unicorn/no-lonely-if': 'error',
  // forbid classes that only have static members
  'unicorn/no-static-only-class': 'error',
  // disallow unreadable array destructuring
  'unicorn/no-unreadable-array-destructuring': 'error',
  // disallow unsafe regular expressions
  'unicorn/no-unsafe-regex': 'error',
  // disallow unused object properties
  'unicorn/no-unused-properties': 'error',
  // enforce lowercase identifier and uppercase value for number literals
  'unicorn/number-literal-case': 'error',
  // prefer `Array#indexOf` over `Array#findIndex`` when looking for the index of an item
  'unicorn/prefer-array-index-of': 'error',
  // prefer default parameters over reassignment
  'unicorn/prefer-default-parameters': 'error',
  // prefer `String#slice` over `String#{ substr, substring }`
  'unicorn/prefer-string-slice': 'error',
  // prefer `switch` over multiple `else-if`
  'unicorn/prefer-switch': ['error', { minimumCases: 3 }],
  // enforce using the separator argument with `Array#join()`
  'unicorn/require-array-join-separator': 'error',
  // enforce using the digits argument with `Number#toFixed()`
  'unicorn/require-number-to-fixed-digits-argument': 'error',
  // enforce using the `targetOrigin`` argument with `window.postMessage()`
  'unicorn/require-post-message-target-origin': 'error',

  // sonarjs
  // collection sizes and array length comparisons should make sense
  'sonarjs/no-collection-size-mischeck': 'error',
  // two branches in a conditional structure should not have exactly the same implementation
  'sonarjs/no-duplicated-branches': 'error',
  // collection elements should not be replaced unconditionally
  'sonarjs/no-element-overwrite': 'error',
  // empty collections should not be accessed or iterated
  'sonarjs/no-empty-collection': 'error',
  // function calls should not pass extra arguments
  'sonarjs/no-extra-arguments': 'error',
  // goolean expressions should not be gratuitous
  'sonarjs/no-gratuitous-expressions': 'error',
  // functions should not have identical implementations
  'sonarjs/no-identical-functions': 'error',
  // boolean checks should not be inverted
  'sonarjs/no-inverted-boolean-check': 'error',
  // loops with at most one iteration should be refactored
  'sonarjs/no-one-iteration-loop': 'error',
  // boolean literals should not be redundant
  'sonarjs/no-redundant-boolean': 'error',
  // jump statements should not be redundant
  'sonarjs/no-redundant-jump': 'error',
  // conditionals should start on new lines
  'sonarjs/no-same-line-conditional': 'error',
  // collection and array contents should be used
  'sonarjs/no-unused-collection': 'error',
  // the output of functions that don't return anything should not be used
  'sonarjs/no-use-of-empty-return-value': 'error',
  // non-existent operators '=+', '=-' and '=!' should not be used
  'sonarjs/non-existent-operator': 'error',
  // local variables should not be declared and then immediately returned or thrown
  'sonarjs/prefer-immediate-return': 'error',
  // object literal syntax should be used
  'sonarjs/prefer-object-literal': 'error',
  // return of boolean expressions should not be wrapped into an `if-then-else` statement
  'sonarjs/prefer-single-boolean-return': 'error',
  // a `while` loop should be used instead of a `for` loop with condition only
  'sonarjs/prefer-while': 'error',

  // regexp
  // disallow confusing quantifiers
  'regexp/confusing-quantifier': 'error',
  // enforce consistent escaping of control characters
  'regexp/control-character-escape': 'error',
  // enforce consistent usage of hexadecimal escape
  'regexp/hexadecimal-escape': ['error', 'never'],
  // enforce into your favorite case
  'regexp/letter-case': ['error', {
    caseInsensitive: 'lowercase',
    unicodeEscape: 'uppercase',
  }],
  // enforce match any character style
  'regexp/match-any': ['error', { allows: ['[\\S\\s]', 'dotAll'] }],
  // enforce use of escapes on negation
  'regexp/negation': 'error',
  // disallow capturing group that captures assertions
  'regexp/no-assertion-capturing-group': 'error',
  // disallow duplicate characters in the RegExp character class
  'regexp/no-dupe-characters-character-class': 'error',
  // disallow duplicate disjunctions
  'regexp/no-dupe-disjunctions': ['error', { report: 'all' }],
  // disallow alternatives without elements
  'regexp/no-empty-alternative': 'error',
  // disallow empty group
  'regexp/no-empty-group': 'error',
  // disallow empty lookahead assertion or empty lookbehind assertion
  'regexp/no-empty-lookarounds-assertion': 'error',
  // disallow escape backspace `([\b])`
  'regexp/no-escape-backspace': 'error',
  // disallow invisible raw character
  'regexp/no-invisible-character': 'error',
  // disallow lazy quantifiers at the end of an expression
  'regexp/no-lazy-ends': 'error',
  // disallow legacy RegExp features
  'regexp/no-legacy-features': 'error',
  // disallow non-standard flags
  'regexp/no-non-standard-flag': 'error',
  // disallow obscure character ranges
  'regexp/no-obscure-range': 'error',
  // disallow octal escape sequence
  'regexp/no-octal': 'error',
  // disallow optional assertions
  'regexp/no-optional-assertion': 'error',
  // disallow backreferences that reference a group that might not be matched
  'regexp/no-potentially-useless-backreference': 'error',
  // disallow standalone backslashes
  'regexp/no-standalone-backslash': 'error',
  // disallow exponential and polynomial backtracking
  'regexp/no-super-linear-backtracking': 'error',
  // disallow trivially nested assertions
  'regexp/no-trivially-nested-assertion': 'error',
  // disallow nested quantifiers that can be rewritten as one quantifier
  'regexp/no-trivially-nested-quantifier': 'error',
  // disallow unused capturing group
  'regexp/no-unused-capturing-group': 'error',
  // disallow assertions that are known to always accept (or reject)
  'regexp/no-useless-assertions': 'error',
  // disallow useless backreferences in regular expressions
  'regexp/no-useless-backreference': 'error',
  // disallow character class with one character
  'regexp/no-useless-character-class': 'error',
  // disallow useless `$` replacements in replacement string
  'regexp/no-useless-dollar-replacements': 'error',
  // disallow unnecessary string escaping
  'regexp/no-useless-escape': 'error',
  // disallow unnecessary exactly quantifier
  'regexp/no-useless-exactly-quantifier': 'error',
  // disallow unnecessary regex flags
  'regexp/no-useless-flag': 'error',
  // disallow unnecessary non-capturing group
  'regexp/no-useless-non-capturing-group': 'error',
  // disallow unnecessary quantifier non-greedy (`?`)
  'regexp/no-useless-non-greedy': 'error',
  // disallow quantifiers that can be removed
  'regexp/no-useless-quantifier': 'error',
  // disallow unnecessary range of characters by using a hyphen
  'regexp/no-useless-range': 'error',
  // disallow unnecessary `{n,m}`` quantifier
  'regexp/no-useless-two-nums-quantifier': 'error',
  // disallow quantifiers with a maximum of zero
  'regexp/no-zero-quantifier': 'error',
  // require optimal quantifiers for concatenated quantifiers
  'regexp/optimal-quantifier-concatenation': 'error',
  // disallow the alternatives of lookarounds that end with a non-constant quantifier
  'regexp/optimal-lookaround-quantifier': 'error',
  // enforces elements order in character class
  'regexp/order-in-character-class': 'error',
  // enforce using character class
  'regexp/prefer-character-class': 'error',
  // enforce using `\d`
  'regexp/prefer-d': 'error',
  // enforces escape of replacement `$` character (`$$`)
  'regexp/prefer-escape-replacement-dollar-char': 'error',
  // enforce using `+` quantifier
  'regexp/prefer-plus-quantifier': 'error',
  // enforce using quantifier
  'regexp/prefer-quantifier': 'error',
  // enforce using `?` quantifier
  'regexp/prefer-question-quantifier': 'error',
  // enforce using character class range
  'regexp/prefer-range': ['error', { target: 'alphanumeric' }],
  // enforce that `RegExp#exec` is used instead of `String#match` if no global flag is provided
  'regexp/prefer-regexp-exec': 'error',
  //  enforce that `RegExp#test` is used instead of `String#match` and `RegExp#exec`
  'regexp/prefer-regexp-test': 'error',
  // enforce using `*` quantifier
  'regexp/prefer-star-quantifier': 'error',
  // enforce using `\t`
  'regexp/prefer-t': 'error',
  // enforce use of unicode codepoint escapes
  'regexp/prefer-unicode-codepoint-escapes': 'error',
  // enforce using `\w`
  'regexp/prefer-w': 'error',
  // sort alternatives if order doesn't matter
  'regexp/sort-alternatives': 'error',
  // require regex flags to be sorted
  'regexp/sort-flags': 'error',
  // disallow not strictly valid regular expressions
  'regexp/strict': 'error',
  // enforce consistent usage of unicode escape or unicode codepoint escape
  'regexp/unicode-escape': 'error',

  // disallow \u2028 and \u2029 in string literals
  'es/no-json-superset': 'error',

  // eslint-comments
  // require include descriptions in eslint directive-comments
  'eslint-comments/require-description': 'error',
};

const es5 = {
  // disallow function or variable declarations in nested blocks
  'no-inner-declarations': 'error',
  // require let or const instead of var
  'no-var': 'off',
  // require or disallow method and property shorthand syntax for object literals
  'object-shorthand': 'off',
  // require using arrow functions for callbacks
  'prefer-arrow-callback': 'off',
  // require const declarations for variables that are never reassigned after declared
  'prefer-const': 'off',
  // require destructuring from arrays and/or objects
  'prefer-destructuring': 'off',
  // prefer the exponentiation operator over `Math.pow()`
  'prefer-exponentiation-operator': 'off',
  // require template literals instead of string concatenation
  'prefer-template': 'off',
  // require strict mode directives
  strict: 'off',
  // prefer default parameters over reassignment
  'unicorn/prefer-default-parameters': 'off',
};

const forbidES5BuiltIns = {
  'es/no-array-isarray': 'error',
  'es/no-array-prototype-every': 'error',
  'es/no-array-prototype-filter': 'error',
  'es/no-array-prototype-foreach': 'error',
  'es/no-array-prototype-indexof': 'error',
  'es/no-array-prototype-lastindexof': 'error',
  'es/no-array-prototype-map': 'error',
  'es/no-array-prototype-reduce': 'error',
  'es/no-array-prototype-reduceright': 'error',
  'es/no-array-prototype-some': 'error',
  'es/no-date-now': 'error',
  'es/no-json': 'error',
  'es/no-object-defineproperties': 'error',
  'es/no-object-defineproperty': 'error',
  'es/no-object-freeze': 'error',
  'es/no-object-getownpropertydescriptor': 'error',
  'es/no-object-getownpropertynames': 'error',
  'es/no-object-getprototypeof': 'error',
  'es/no-object-isextensible': 'error',
  'es/no-object-isfrozen': 'error',
  'es/no-object-issealed': 'error',
  'es/no-object-keys': 'error',
  'es/no-object-preventextensions': 'error',
  'es/no-object-seal': 'error',
  'es/no-string-prototype-trim': 'error',
};

const forbidES2015BuiltIns = {
  'es/no-array-from': 'error',
  'es/no-array-of': 'error',
  'es/no-array-prototype-copywithin': 'error',
  'es/no-array-prototype-entries': 'error',
  'es/no-array-prototype-fill': 'error',
  'es/no-array-prototype-find': 'error',
  'es/no-array-prototype-findindex': 'error',
  'es/no-array-prototype-keys': 'error',
  'es/no-array-prototype-values': 'error',
  'es/no-map': 'error',
  'es/no-math-acosh': 'error',
  'es/no-math-asinh': 'error',
  'es/no-math-atanh': 'error',
  'es/no-math-cbrt': 'error',
  'es/no-math-clz32': 'error',
  'es/no-math-cosh': 'error',
  'es/no-math-expm1': 'error',
  'es/no-math-fround': 'error',
  'es/no-math-hypot': 'error',
  'es/no-math-imul': 'error',
  'es/no-math-log10': 'error',
  'es/no-math-log1p': 'error',
  'es/no-math-log2': 'error',
  'es/no-math-sign': 'error',
  'es/no-math-sinh': 'error',
  'es/no-math-tanh': 'error',
  'es/no-math-trunc': 'error',
  'es/no-number-epsilon': 'error',
  'es/no-number-isfinite': 'error',
  'es/no-number-isinteger': 'error',
  'es/no-number-isnan': 'error',
  'es/no-number-issafeinteger': 'error',
  'es/no-number-maxsafeinteger': 'error',
  'es/no-number-minsafeinteger': 'error',
  'es/no-number-parsefloat': 'error',
  'es/no-number-parseint': 'error',
  'es/no-object-assign': 'error',
  'es/no-object-getownpropertysymbols': 'error',
  'es/no-object-is': 'error',
  'es/no-object-setprototypeof': 'error',
  'es/no-promise': 'error',
  'es/no-proxy': 'error',
  'es/no-reflect': 'error',
  'es/no-regexp-prototype-flags': 'error',
  'es/no-set': 'error',
  'es/no-string-fromcodepoint': 'error',
  'es/no-string-prototype-codepointat': 'error',
  'es/no-string-prototype-endswith': 'error',
  'es/no-string-prototype-includes': 'error',
  'es/no-string-prototype-normalize': 'error',
  'es/no-string-prototype-repeat': 'error',
  'es/no-string-prototype-startswith': 'error',
  'es/no-string-raw': 'error',
  'es/no-symbol': 'error',
  'es/no-typed-arrays': 'error',
  'es/no-weak-map': 'error',
  'es/no-weak-set': 'error',
};

const forbidES2016BuiltIns = {
  'es/no-array-prototype-includes': 'error',
};

const forbidES2017BuiltIns = {
  'es/no-atomics': 'error',
  'es/no-object-entries': 'error',
  'es/no-object-getownpropertydescriptors': 'error',
  'es/no-object-values': 'error',
  'es/no-shared-array-buffer': 'error',
  'es/no-string-prototype-padstart-padend': 'error',
};

const forbidES2018BuiltIns = {
  'es/no-promise-prototype-finally': 'error',
};

const forbidES2019BuiltIns = {
  'es/no-array-prototype-flat': 'error',
  'es/no-object-fromentries': 'error',
  'es/no-string-prototype-trimstart-trimend': 'error',
  'es/no-symbol-prototype-description': 'error',
};

const forbidES2020BuiltIns = {
  'es/no-bigint': 'error',
  'es/no-global-this': 'error',
  'es/no-promise-all-settled': 'error',
  'es/no-string-prototype-matchall': 'error',
};

const forbidES2021BuiltIns = {
  'es/no-promise-any': 'error',
  'es/no-string-prototype-replaceall': 'error',
  'es/no-weakrefs': 'error',
};

const forbidModernESBuiltIns = {
  ...forbidES5BuiltIns,
  ...forbidES2015BuiltIns,
  ...forbidES2016BuiltIns,
  ...forbidES2017BuiltIns,
  ...forbidES2018BuiltIns,
  ...forbidES2019BuiltIns,
  ...forbidES2020BuiltIns,
  ...forbidES2021BuiltIns,
};

const transpiledAndPolyfilled = {
  // disallow accessor properties
  'es/no-accessor-properties': 'error',
  // disallow async functions
  'es/no-async-functions': 'error',
  // disallow async iteration
  'es/no-async-iteration': 'error',
  // disallow generators
  'es/no-generators': 'error',
  // unpolyfillable es2015 builtins
  'es/no-proxy': 'error',
  'es/no-string-prototype-normalize': 'error',
  // unpolyfillable es2017 builtins
  'es/no-atomics': 'error',
  'es/no-shared-array-buffer': 'error',
  // unpolyfillable es2020 builtins
  'es/no-bigint': 'error',
  // unpolyfillable es2021 builtins
  'es/no-weakrefs': 'error',
};

const nodePackages = {
  // disallow unsupported ECMAScript built-ins on the specified version
  'node/no-unsupported-features/node-builtins': ['error', { version: SUPPORTED_NODE_VERSIONS }],
  ...disable(forbidES5BuiltIns),
  ...disable(forbidES2015BuiltIns),
  ...disable(forbidES2016BuiltIns),
  ...disable(forbidES2017BuiltIns),
  'es/no-atomics': 'error',
  'es/no-shared-array-buffer': 'error',
  ...forbidES2018BuiltIns,
  ...forbidES2019BuiltIns,
  ...forbidES2020BuiltIns,
  ...forbidES2021BuiltIns,
};

const nodeDev = {
  // disallow unsupported ECMAScript built-ins on the specified version
  'node/no-unsupported-features/node-builtins': ['error', { version: DEV_NODE_VERSIONS }],
  ...disable(forbidModernESBuiltIns),
  ...forbidES2021BuiltIns,
  'es/no-weakrefs': 'off',
};

const tests = {
  // relax for testing:
  // enforces return statements in callbacks of array's methods
  'array-callback-return': 'off',
  // specify the maximum length of a line in your program
  'max-len': ['error', { code: 180, tabWidth: 2 }],
  // specify the maximum number of statement allowed in a function
  'max-statements': 'off',
  // disallow function declarations and expressions inside loop statements
  'no-loop-func': 'off',
  // disallow use of new operator when not part of the assignment or comparison
  'no-new': 'off',
  // disallow use of new operator for Function object
  'no-new-func': 'off',
  // disallows creating new instances of String, Number, and Boolean
  'no-new-wrappers': 'off',
  // restrict what can be thrown as an exception
  'no-throw-literal': 'off',
  // disallow usage of expressions in statement position
  'no-unused-expressions': 'off',
  // disallow unnecessary calls to `.call()` and `.apply()`
  'no-useless-call': 'off',
  // enforce passing a message value when throwing a built-in error
  'unicorn/error-message': 'off',
  // functions should not have identical implementations
  'sonarjs/no-identical-functions': 'off',
};

const qunit = {
  // ensure the correct number of assert arguments is used
  'qunit/assert-args': 'error',
  // forbid the use of assert.equal
  'qunit/no-assert-equal': 'error',
  // require use of boolean assertions
  'qunit/no-assert-equal-boolean': 'error',
  // forbid binary logical expressions in assert arguments
  'qunit/no-assert-logical-expression': 'error',
  // forbid async calls in loops
  'qunit/no-async-in-loops': 'error',
  // disallow async module callbacks
  'qunit/no-async-module-callbacks': 'error',
  // forbid the use of asyncTest
  'qunit/no-async-test': 'error',
  // disallow the use of hooks from ancestor modules
  'qunit/no-hooks-from-ancestor-modules': 'error',
  // forbid commented tests
  'qunit/no-commented-tests': 'error',
  // forbid comparing relational expression to boolean in assertions
  'qunit/no-compare-relation-boolean': 'error',
  // prevent early return in a qunit test
  'qunit/no-early-return': 'error',
  // forbid the use of global qunit assertions
  'qunit/no-global-assertions': 'error',
  // forbid the use of global expect
  'qunit/no-global-expect': 'error',
  // forbid the use of global module / test / asyncTest
  'qunit/no-global-module-test': 'error',
  // forbid use of global stop / start
  'qunit/no-global-stop-start': 'error',
  // forbid identical test and module names
  'qunit/no-identical-names': 'error',
  // forbid use of QUnit.init
  'qunit/no-init': 'error',
  // forbid use of QUnit.jsDump
  'qunit/no-jsdump': 'error',
  // forbid QUnit.test() calls inside callback of another QUnit.test
  'qunit/no-nested-tests': 'error',
  // forbid equality comparisons in assert.{ok, notOk}
  'qunit/no-ok-equality': 'error',
  // forbid the use of QUnit.push
  'qunit/no-qunit-push': 'error',
  // forbid QUnit.start within tests or test hooks
  'qunit/no-qunit-start-in-tests': 'error',
  // forbid the use of QUnit.stop
  'qunit/no-qunit-stop': 'error',
  // forbid overwriting of QUnit logging callbacks
  'qunit/no-reassign-log-callbacks': 'error',
  // forbid use of QUnit.reset
  'qunit/no-reset': 'error',
  // forbid setup / teardown module hooks
  'qunit/no-setup-teardown': 'error',
  // forbid expect argument in QUnit.test
  'qunit/no-test-expect-argument': 'error',
  // forbid assert.throws() with block, string, and message
  'qunit/no-throws-string': 'error',
  // enforce use of objects as expected value in `assert.propEqual`
  'qunit/require-object-in-propequal': 'error',
  // require that all async calls should be resolved in tests
  'qunit/resolve-async': 'error',
};

const json = {
  // enforce spacing inside array brackets
  'jsonc/array-bracket-spacing': ['error', 'never'],
  // disallow trailing commas in multiline object literals
  'jsonc/comma-dangle': ['error', 'never'],
  // enforce one true comma style
  'jsonc/comma-style': ['error', 'last'],
  // enforce consistent indentation
  'jsonc/indent': ['error', 2],
  // enforces spacing between keys and values in object literal properties
  'jsonc/key-spacing': ['error', { beforeColon: false, afterColon: true }],
  // disallow BigInt literals
  'jsonc/no-bigint-literals': 'error',
  // disallow comments
  'jsonc/no-comments': 'error',
  // disallow duplicate keys when creating object literals
  'jsonc/no-dupe-keys': 'error',
  // disallow escape sequences in identifiers.
  'jsonc/no-escape-sequence-in-identifier': 'error',
  // disallow use of multiline strings
  'jsonc/no-multi-str': 'error',
  // disallow number property keys
  'jsonc/no-number-props': 'error',
  // disallow use of octal escape sequences in string literals, such as var foo = 'Copyright \251';
  'jsonc/no-octal-escape': 'error',
  // disallow RegExp literals
  'jsonc/no-regexp-literals': 'error',
  // disallow sparse arrays
  'jsonc/no-sparse-arrays': 'error',
  // disallow template literals
  'jsonc/no-template-literals': 'error',
  // disallow `undefined`
  'jsonc/no-undefined-value': 'error',
  // disallow Unicode code point escape sequences.
  'jsonc/no-unicode-codepoint-escapes': 'error',
  // disallow unnecessary string escaping
  'jsonc/no-useless-escape': 'error',
  // enforce consistent line breaks after opening and before closing braces
  'jsonc/object-curly-newline': ['error', { consistent: true }],
  // enforce spaces inside braces
  'jsonc/object-curly-spacing': ['error', 'always'],
  // require or disallow use of quotes around object literal property names
  'jsonc/quote-props': ['error', 'always'],
  // specify whether double or single quotes should be used
  'jsonc/quotes': ['error', 'double'],
  // require or disallow spaces before/after unary operators
  'jsonc/space-unary-ops': 'error',
  // disallow invalid number for JSON
  'jsonc/valid-json-number': 'error',
  // specify the maximum length of a line in your program
  'max-len': ['error', { code: 180, tabWidth: 2 }],
  // require strict mode directives
  strict: 'off',
};

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
  },
  env: {
    // unnececery global builtins disabled by related rules
    es2021: true,
    browser: true,
    node: true,
    worker: true,
  },
  plugins: [
    'es',
    'eslint-comments',
    'import',
    'jsonc',
    'node',
    'qunit',
    'regexp',
    'sonarjs',
    'unicorn',
  ],
  reportUnusedDisableDirectives: true,
  rules: base,
  overrides: [
    {
      files: [
        'packages/core-js/**',
        'packages/core-js-pure/**',
        'tests/compat/**',
        'tests/worker/**',
      ],
      parserOptions: {
        ecmaVersion: 5,
      },
      rules: es5,
    },
    {
      files: [
        'packages/core-js/**',
        'packages/core-js-pure/**',
        'tests/pure/**',
        'tests/worker/**',
      ],
      rules: forbidModernESBuiltIns,
    },
    {
      files: [
        'packages/core-js/postinstall.js',
        'packages/core-js-pure/postinstall.js',
      ],
      rules: disable(forbidES5BuiltIns),
    },
    {
      files: [
        'tests/helpers/**',
        'tests/pure/**',
        'tests/tests/**',
        'tests/wpt-url-resources/**',
      ],
      parserOptions: {
        sourceType: 'module',
      },
      rules: transpiledAndPolyfilled,
    },
    {
      files: [
        'tests/compat/**',
        'tests/helpers/**',
        'tests/observables/**',
        'tests/promises-aplus/**',
        'tests/pure/**',
        'tests/tests/**',
        'tests/worker/**',
        'tests/wpt-url-resources/**',
        'tests/commonjs.js',
        'tests/commonjs-entries-content.js',
        'tests/targets-parser.js',
      ],
      rules: tests,
    },
    {
      files: [
        'tests/helpers/**',
        'tests/pure/**',
        'tests/tests/**',
      ],
      env: {
        qunit: true,
      },
      rules: qunit,
    },
    {
      files: [
        'packages/core-js-builder/**',
        'packages/core-js-compat/**',
      ],
      rules: nodePackages,
    },
    {
      files: [
        'packages/core-js-compat/src/**',
        'scripts/**',
        'tests/observables/**',
        'tests/promises-aplus/**',
        'tests/commonjs.js',
        'tests/commonjs-entries-content.js',
        'tests/targets-parser.js',
        '.eslintrc.js',
        '.webpack.config.js',
        'babel.config.js',
      ],
      rules: nodeDev,
    },
    {
      files: [
        'tests/observables/**',
        'tests/tests/**',
        'tests/compat/**',
      ],
      globals: {
        compositeKey: true,
        compositeSymbol: true,
        AsyncIterator: true,
        Iterator: true,
        Observable: true,
      },
    },
    {
      files: ['*.mjs'],
      parser: '@babel/eslint-parser',
      parserOptions: {
        babelOptions: {
          plugins: ['@babel/plugin-syntax-top-level-await'],
        },
        ecmaVersion: 2022,
        requireConfigFile: false,
        sourceType: 'module',
      },
    },
    {
      files: [
        'packages/core-js-compat/src/**',
        'scripts/**',
      ],
      // zx
      globals: {
        $: true,
        __dirname: true,
        __filename: true,
        argv: true,
        cd: true,
        chalk: true,
        fetch: true,
        fs: true,
        os: true,
        nothrow: true,
        question: true,
        require: true,
        sleep: true,
      },
    },
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',
      rules: json,
    },
  ],
};
