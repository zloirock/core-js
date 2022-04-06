'use strict';
const RESTRICTED_GLOBALS = require('confusing-browser-globals');
const SUPPORTED_NODE_VERSIONS = require('core-js-builder/package').engines.node;
const DEV_NODE_VERSIONS = '^14.15';
const ERROR = 'error';
const OFF = 'off';
const ALWAYS = 'always';
const NEVER = 'never';
const READONLY = 'readonly';

function disable(rules) {
  return Object.keys(rules).reduce((memo, rule) => {
    memo[rule] = OFF;
    return memo;
  }, {});
}

const base = {
  // possible errors:
  // enforce 'for' loop update clause moving the counter in the right direction
  'for-direction': ERROR,
  // disallow window alert / confirm / prompt calls
  'no-alert': ERROR,
  // disallow comparing against -0
  'no-compare-neg-zero': ERROR,
  // disallow use of console
  'no-console': ERROR,
  // disallow constant expressions in conditions
  'no-constant-condition': [ERROR, { checkLoops: false }],
  // disallow use of debugger
  'no-debugger': ERROR,
  // disallow duplicate arguments in functions
  'no-dupe-args': ERROR,
  // disallow duplicate keys when creating object literals
  'no-dupe-keys': ERROR,
  // disallow a duplicate case label.
  'no-duplicate-case': ERROR,
  // disallow else after a return in an if
  'no-else-return': ERROR,
  // disallow empty statements
  'no-empty': ERROR,
  // disallow unnecessary boolean casts
  'no-extra-boolean-cast': ERROR,
  // disallow unnecessary semicolons
  'no-extra-semi': ERROR,
  // disallow assigning to the exception in a catch block
  'no-ex-assign': ERROR,
  // disallow overwriting functions written as function declarations
  'no-func-assign': ERROR,
  // disallow irregular whitespace outside of strings and comments
  'no-irregular-whitespace': ERROR,
  // disallow literal numbers that lose precision
  // 'no-loss-of-precision': ERROR, // TODO
  // disallow the use of object properties of the global object (Math and JSON) as functions
  'no-obj-calls': ERROR,
  // disallow use of Object.prototypes builtins directly
  'no-prototype-builtins': ERROR,
  // disallow specific global variables
  'no-restricted-globals': [ERROR, ...RESTRICTED_GLOBALS],
  // disallow returning values from setters
  'no-setter-return': ERROR,
  // disallow sparse arrays
  'no-sparse-arrays': ERROR,
  // disallow template literal placeholder syntax in regular strings
  'no-template-curly-in-string': ERROR,
  // avoid code that looks like two expressions but is actually one
  'no-unexpected-multiline': ERROR,
  // disallow negation of the left operand of an in expression
  'no-unsafe-negation': ERROR,
  // disallow use of optional chaining in contexts where the `undefined` value is not allowed
  'no-unsafe-optional-chaining': ERROR,
  // disallow loops with a body that allows only one iteration
  'no-unreachable-loop': ERROR,
  // disallow unused private class members
  'no-unused-private-class-members': ERROR,
  // disallow comparisons with the value NaN
  'use-isnan': ERROR,
  // disallow unreachable statements after a return, throw, continue, or break statement
  'no-unreachable': ERROR,
  // ensure that the results of typeof are compared against a valid string
  'valid-typeof': ERROR,

  // best practices:
  // enforces return statements in callbacks of array's methods
  'array-callback-return': ERROR,
  // enforce default clauses in switch statements to be last
  'default-case-last': ERROR,
  // encourages use of dot notation whenever possible
  'dot-notation': [ERROR, { allowKeywords: true }],
  // enforce newline before and after dot
  'dot-location': [ERROR, 'property'],
  // disallow use of arguments.caller or arguments.callee
  'no-caller': ERROR,
  // disallow lexical declarations in case/default clauses
  'no-case-declarations': ERROR,
  // disallow duplicate conditions in if-else-if chains
  'no-dupe-else-if': ERROR,
  // disallow empty functions, except for standalone funcs/arrows
  'no-empty-function': ERROR,
  // disallow empty destructuring patterns
  'no-empty-pattern': ERROR,
  // disallow use of eval()
  'no-eval': ERROR,
  // disallow adding to native types
  'no-extend-native': ERROR,
  // disallow unnecessary function binding
  'no-extra-bind': ERROR,
  // disallow unnecessary labels
  'no-extra-label': ERROR,
  // disallow fallthrough of case statements
  'no-fallthrough': [ERROR, { commentPattern: 'break omitted' }],
  // disallow the use of leading or trailing decimal points in numeric literals
  'no-floating-decimal': ERROR,
  // disallow reassignments of native objects
  'no-global-assign': ERROR,
  // disallow use of eval()-like methods
  'no-implied-eval': ERROR,
  // disallow usage of __iterator__ property
  'no-iterator': ERROR,
  // disallow use of labels for anything other then loops and switches
  'no-labels': [ERROR, { allowLoop: false, allowSwitch: false }],
  // disallow unnecessary nested blocks
  'no-lone-blocks': ERROR,
  // disallow function declarations and expressions inside loop statements
  'no-loop-func': ERROR,
  // disallow use of multiple spaces
  'no-multi-spaces': [ERROR, { ignoreEOLComments: true }],
  // disallow use of multiline strings
  'no-multi-str': ERROR,
  // disallow use of new operator when not part of the assignment or comparison
  'no-new': ERROR,
  // disallow use of new operator for Function object
  'no-new-func': ERROR,
  // disallows creating new instances of String, Number, and Boolean
  'no-new-wrappers': ERROR,
  // disallow use of (old style) octal literals
  'no-octal': ERROR,
  // disallow `\8` and `\9` escape sequences in string literals
  'no-nonoctal-decimal-escape': ERROR,
  // disallow use of octal escape sequences in string literals, such as var foo = 'Copyright \251';
  'no-octal-escape': ERROR,
  // disallow usage of __proto__ property
  'no-proto': ERROR,
  // disallow declaring the same variable more then once
  'no-redeclare': ERROR,
  // disallow unnecessary calls to `.call()` and `.apply()`
  'no-useless-call': ERROR,
  // disallow redundant return statements
  'no-useless-return': ERROR,
  // disallow use of `javascript:` urls.
  'no-script-url': ERROR,
  // disallow self assignment
  'no-self-assign': ERROR,
  // disallow comparisons where both sides are exactly the same
  'no-self-compare': ERROR,
  // disallow use of comma operator
  'no-sequences': ERROR,
  // restrict what can be thrown as an exception
  'no-throw-literal': ERROR,
  // disallow usage of expressions in statement position
  'no-unused-expressions': [ERROR, { allowShortCircuit: true, allowTernary: true }],
  // disallow unused labels
  'no-unused-labels': ERROR,
  // disallow unnecessary catch clauses
  'no-useless-catch': ERROR,
  // disallow useless string concatenation
  'no-useless-concat': ERROR,
  // disallow void operators
  'no-void': ERROR,
  // disallow use of the with statement
  'no-with': ERROR,
  // require use of the second argument for parseInt()
  radix: ERROR,

  // variables:
  // disallow catch clause parameters from shadowing variables in the outer scope
  'no-catch-shadow': ERROR,
  // disallow deletion of variables
  'no-delete-var': ERROR,
  // disallow labels that share a name with a variable
  'no-label-var': ERROR,
  // disallow declaration of variables already declared in the outer scope
  'no-shadow': ERROR,
  // disallow shadowing of names such as arguments
  'no-shadow-restricted-names': ERROR,
  // disallow use of undeclared variables unless mentioned in a /*global */ block
  'no-undef': [ERROR],
  // disallow initializing variables to undefined
  'no-undef-init': ERROR,
  // disallow declaration of variables that are not used in the code
  'no-unused-vars': [ERROR, { vars: 'local', args: 'after-used', ignoreRestSiblings: true }],

  // stylistic issues:
  // enforce spacing inside array brackets
  'array-bracket-spacing': [ERROR, NEVER],
  // enforce spacing inside single-line blocks
  'block-spacing': [ERROR, ALWAYS],
  // enforce one true brace style
  'brace-style': [ERROR, '1tbs', { allowSingleLine: true }],
  // require camel case names
  camelcase: [ERROR, { properties: NEVER }],
  // enforce trailing commas in multiline object literals
  'comma-dangle': [ERROR, 'always-multiline'],
  // enforce spacing after comma
  'comma-spacing': ERROR,
  // enforce one true comma style
  'comma-style': [ERROR, 'last', { exceptions: { VariableDeclaration: true } }],
  // disallow padding inside computed properties
  'computed-property-spacing': [ERROR, NEVER],
  // enforce one newline at the end of files
  'eol-last': [ERROR, ALWAYS],
  // disallow space between function identifier and application
  'func-call-spacing': ERROR,
  // enforce consistent indentation
  indent: [ERROR, 2, {
    ignoredNodes: ['ConditionalExpression'],
    SwitchCase: 1,
    VariableDeclarator: 'first',
  }],
  // require a space before & after certain keywords
  'keyword-spacing': [ERROR, { before: true, after: true }],
  // enforces spacing between keys and values in object literal properties
  'key-spacing': [ERROR, { beforeColon: false, afterColon: true }],
  // enforce consistent linebreak style
  'linebreak-style': [ERROR, 'unix'],
  // specify the maximum length of a line in your program
  'max-len': [ERROR, {
    code: 140,
    tabWidth: 2,
    ignoreRegExpLiterals: true,
    ignoreTemplateLiterals: true,
    ignoreUrls: true,
  }],
  // enforce a maximum depth that callbacks can be nested
  'max-nested-callbacks': [ERROR, 4],
  // specify the maximum number of statement allowed in a function
  'max-statements': [ERROR, 50],
  // require a capital letter for constructors
  'new-cap': [ERROR, { newIsCap: true, capIsNew: false }],
  // require parentheses when invoking a constructor with no arguments
  'new-parens': ERROR,
  // disallow `if` as the only statement in an `else` block
  'no-lonely-if': ERROR,
  // disallow mixed spaces and tabs for indentation
  'no-mixed-spaces-and-tabs': ERROR,
  // disallow multiple empty lines and only one newline at the end
  'no-multiple-empty-lines': [ERROR, { max: 1, maxEOF: 1 }],
  // disallow tabs
  'no-tabs': ERROR,
  // disallow trailing whitespace at the end of lines
  'no-trailing-spaces': ERROR,
  // disallow the use of boolean literals in conditional expressions and prefer `a || b` over `a ? a : b`
  'no-unneeded-ternary': [ERROR, { defaultAssignment: false }],
  // disallow whitespace before properties
  'no-whitespace-before-property': ERROR,
  // enforce the location of single-line statements
  'nonblock-statement-body-position': [ERROR, 'beside'],
  // enforce consistent line breaks after opening and before closing braces
  'object-curly-newline': [ERROR, { consistent: true }],
  // enforce spaces inside braces
  'object-curly-spacing': [ERROR, ALWAYS],
  // require newlines around variable declarations with initializations
  'one-var-declaration-per-line': [ERROR, 'initializations'],
  // enforce padding within blocks
  'padded-blocks': [ERROR, NEVER],
  // specify whether double or single quotes should be used
  quotes: [ERROR, 'single', 'avoid-escape'],
  // require or disallow use of quotes around object literal property names
  'quote-props': [ERROR, 'as-needed', { keywords: false }],
  // require or disallow use of semicolons instead of ASI
  semi: [ERROR, ALWAYS],
  // enforce spacing before and after semicolons
  'semi-spacing': ERROR,
  // enforce location of semicolons
  'semi-style': [ERROR, 'last'],
  // require or disallow space before blocks
  'space-before-blocks': ERROR,
  // require or disallow space before function opening parenthesis
  'space-before-function-paren': [ERROR, { anonymous: ALWAYS, named: NEVER }],
  // require or disallow spaces inside parentheses
  'space-in-parens': ERROR,
  // require spaces around operators
  'space-infix-ops': ERROR,
  // require or disallow spaces before/after unary operators
  'space-unary-ops': ERROR,
  // require or disallow a space immediately following the // or /* in a comment
  'spaced-comment': [ERROR, ALWAYS, { line: { exceptions: ['/'] }, block: { exceptions: ['*'] } }],
  // enforce spacing around colons of switch statements
  'switch-colon-spacing': ERROR,
  // require or disallow the Unicode Byte Order Mark
  'unicode-bom': [ERROR, NEVER],

  // import:
  // ensure all imports appear before other statements
  'import/first': ERROR,
  // forbid AMD imports
  'import/no-amd': ERROR,
  // forbid cycle dependencies
  'import/no-cycle': [ERROR, { commonjs: true }],
  // ensure imports point to files / modules that can be resolved
  'import/no-unresolved': [ERROR, { commonjs: true }],
  // forbid import of modules using absolute paths
  'import/no-absolute-path': ERROR,
  // forbid `require()` calls with expressions
  'import/no-dynamic-require': ERROR,
  // disallow importing from the same path more than once
  'import/no-duplicates': ERROR,
  // forbid imports with CommonJS exports
  'import/no-import-module-exports': ERROR,
  // prevent importing packages through relative paths
  'import/no-relative-packages': ERROR,
  // forbid a module from importing itself
  'import/no-self-import': ERROR,
  // forbid useless path segments
  'import/no-useless-path-segments': ERROR,

  // node:
  // disallow deprecated APIs
  'n/no-deprecated-api': ERROR,
  // require require() calls to be placed at top-level module scope
  'n/global-require': ERROR,
  // disallow the assignment to `exports`
  'n/no-exports-assign': ERROR,
  // disallow require calls to be mixed with regular variable declarations
  'n/no-mixed-requires': [ERROR, { grouping: true, allowCall: false }],
  // disallow new operators with calls to require
  'n/no-new-require': ERROR,
  // disallow string concatenation with `__dirname` and `__filename`
  'n/no-path-concat': ERROR,
  // disallow the use of `process.exit()`
  'n/no-process-exit': ERROR,
  // prefer global
  'n/prefer-global/buffer': [ERROR, ALWAYS],
  'n/prefer-global/console': [ERROR, ALWAYS],
  'n/prefer-global/process': [ERROR, ALWAYS],
  'n/prefer-global/text-decoder': [ERROR, ALWAYS],
  'n/prefer-global/text-encoder': [ERROR, ALWAYS],
  'n/prefer-global/url-search-params': [ERROR, ALWAYS],
  'n/prefer-global/url': [ERROR, ALWAYS],

  // es6+:
  // require parentheses around arrow function arguments
  'arrow-parens': [ERROR, 'as-needed'],
  // enforce consistent spacing before and after the arrow in arrow functions
  'arrow-spacing': ERROR,
  // enforce the location of arrow function bodies
  'implicit-arrow-linebreak': [ERROR, 'beside'],
  // disallow unnecessary computed property keys in object literals
  'no-useless-computed-key': ERROR,
  // disallow unnecessary constructors
  'no-useless-constructor': ERROR,
  // require let or const instead of var
  'no-var': ERROR,
  // disallow renaming import, export, and destructured assignments to the same name
  'no-useless-rename': ERROR,
  // require or disallow method and property shorthand syntax for object literals
  'object-shorthand': ERROR,
  // require using arrow functions for callbacks
  'prefer-arrow-callback': ERROR,
  // require const declarations for variables that are never reassigned after declared
  'prefer-const': [ERROR, { destructuring: 'all' }],
  // require destructuring from arrays and/or objects
  'prefer-destructuring': ERROR,
  // prefer the exponentiation operator over `Math.pow()`
  'prefer-exponentiation-operator': ERROR,
  // prefer `Object.hasOwn`
  'prefer-object-has-own': ERROR,
  // require template literals instead of string concatenation
  'prefer-template': ERROR,
  // disallow generator functions that do not have `yield`
  'require-yield': ERROR,
  // enforce spacing between rest and spread operators and their expressions
  'rest-spread-spacing': ERROR,
  // require or disallow spacing around embedded expressions of template strings
  'template-curly-spacing': [ERROR, ALWAYS],

  // require strict mode directives
  strict: [ERROR, 'global'],

  // array-func:
  // avoid reversing the array and running a method on it if there is an equivalent of the method operating on the array from the other end
  'array-func/avoid-reverse': ERROR,
  // prefer using the `mapFn` callback of `Array.from` over an immediate `.map()` call on the `Array.from` result
  'array-func/from-map': ERROR,
  // avoid the `this` parameter when providing arrow function as callback in array functions
  'array-func/no-unnecessary-this-arg': ERROR,

  // promise:
  // avoid calling `cb()` inside of a `then()` or `catch()`
  'promise/no-callback-in-promise': ERROR,
  // avoid nested `then()` or `catch()` statements
  'promise/no-nesting': ERROR,
  // avoid calling new on a `Promise` static method
  'promise/no-new-statics': ERROR,
  // avoid using promises inside of callbacks
  'promise/no-promise-in-callback': ERROR,
  // disallow return statements in `finally()`
  'promise/no-return-in-finally': ERROR,
  // avoid wrapping values in `Promise.resolve` or `Promise.reject` when not needed
  'promise/no-return-wrap': ERROR,
  // enforce consistent param names when creating new promises
  'promise/param-names': ERROR,
  // ensures the proper number of arguments are passed to `Promise` functions
  'promise/valid-params': ERROR,

  // unicorn
  // enforce a specific parameter name in catch clauses
  'unicorn/catch-error-name': [ERROR, { name: ERROR, ignore: [/^err/] }],
  // enforce passing a message value when throwing a built-in error
  'unicorn/error-message': ERROR,
  // require escape sequences to use uppercase values
  'unicorn/escape-case': ERROR,
  // enforce a case style for filenames
  'unicorn/filename-case': [ERROR, { case: 'kebabCase' }],
  // enforce importing index files with `.`
  'unicorn/import-index': ERROR,
  // enforce specifying rules to disable in eslint-disable comments
  'unicorn/no-abusive-eslint-disable': ERROR,
  // enforce combining multiple `Array#push` into one call
  'unicorn/no-array-push-push': ERROR,
  // do not use leading/trailing space between `console.log` parameters
  'unicorn/no-console-spaces': ERROR,
  // enforce the use of unicode escapes instead of hexadecimal escapes
  'unicorn/no-hex-escape': ERROR,
  // prevent calling `EventTarget#removeEventListener()` with the result of an expression
  'unicorn/no-invalid-remove-event-listener': ERROR,
  // disallow `if` statements as the only statement in `if` blocks without `else`
  'unicorn/no-lonely-if': ERROR,
  // forbid classes that only have static members
  'unicorn/no-static-only-class': ERROR,
  // disallow `then` property
  'unicorn/no-thenable': ERROR,
  // disallow unreadable array destructuring
  'unicorn/no-unreadable-array-destructuring': ERROR,
  // disallow unreadable IIFEs
  'unicorn/no-unreadable-iife': ERROR,
  // disallow unused object properties
  'unicorn/no-unused-properties': ERROR,
  // forbid useless fallback when spreading in object literals
  'unicorn/no-useless-fallback-in-spread': ERROR,
  // disallow useless array length check
  'unicorn/no-useless-length-check': ERROR,
  // disallow returning / yielding `Promise.{ resolve, reject }` in async functions or promise callbacks
  'unicorn/no-useless-promise-resolve-reject': ERROR,
  // disallow useless spread
  'unicorn/no-useless-spread': ERROR,
  // disallow useless case in switch statements
  'unicorn/no-useless-switch-case': ERROR,
  // enforce lowercase identifier and uppercase value for number literals
  'unicorn/number-literal-case': ERROR,
  // prefer `.find(…)` over the first element from `.filter(…)`
  'unicorn/prefer-array-find': ERROR,
  // use `.flat()` to flatten an array of arrays
  'unicorn/prefer-array-flat': ERROR,
  // use `.flatMap()` to map and then flatten an array instead of using `.map().flat()`
  'unicorn/prefer-array-flat-map': ERROR,
  // prefer `Array#indexOf` over `Array#findIndex`` when looking for the index of an item
  'unicorn/prefer-array-index-of': ERROR,
  // prefer `.some(…)` over `.filter(…).length` check and `.find(…)`
  'unicorn/prefer-array-some': ERROR,
  // prefer code points over char codes
  'unicorn/prefer-code-point': ERROR,
  // prefer default parameters over reassignment
  'unicorn/prefer-default-parameters': ERROR,
  // prefer reading a `JSON` file as a buffer
  'unicorn/prefer-json-parse-buffer': ERROR,
  // prefer modern `Math`` APIs over legacy patterns
  'unicorn/prefer-modern-math-apis': ERROR,
  // prefer `String#slice` over `String#{ substr, substring }`
  'unicorn/prefer-string-slice': ERROR,
  // prefer `switch` over multiple `else-if`
  'unicorn/prefer-switch': [ERROR, { minimumCases: 3 }],
  // enforce consistent relative `URL` style
  'unicorn/relative-url-style': [ERROR, ALWAYS],
  // enforce using the separator argument with `Array#join()`
  'unicorn/require-array-join-separator': ERROR,
  // enforce using the digits argument with `Number#toFixed()`
  'unicorn/require-number-to-fixed-digits-argument': ERROR,
  // enforce using the `targetOrigin`` argument with `window.postMessage()`
  'unicorn/require-post-message-target-origin': ERROR,
  // enforce consistent case for text encoding identifiers
  'unicorn/text-encoding-identifier-case': ERROR,

  // sonarjs
  // collection sizes and array length comparisons should make sense
  'sonarjs/no-collection-size-mischeck': ERROR,
  // two branches in a conditional structure should not have exactly the same implementation
  'sonarjs/no-duplicated-branches': ERROR,
  // collection elements should not be replaced unconditionally
  'sonarjs/no-element-overwrite': ERROR,
  // empty collections should not be accessed or iterated
  'sonarjs/no-empty-collection': ERROR,
  // function calls should not pass extra arguments
  'sonarjs/no-extra-arguments': ERROR,
  // boolean expressions should not be gratuitous
  'sonarjs/no-gratuitous-expressions': ERROR,
  // functions should not have identical implementations
  'sonarjs/no-identical-functions': ERROR,
  // boolean literals should not be redundant
  'sonarjs/no-redundant-boolean': ERROR,
  // jump statements should not be redundant
  'sonarjs/no-redundant-jump': ERROR,
  // conditionals should start on new lines
  'sonarjs/no-same-line-conditional': ERROR,
  // collection and array contents should be used
  'sonarjs/no-unused-collection': ERROR,
  // the output of functions that don't return anything should not be used
  'sonarjs/no-use-of-empty-return-value': ERROR,
  // non-existent operators '=+', '=-' and '=!' should not be used
  'sonarjs/non-existent-operator': ERROR,
  // local variables should not be declared and then immediately returned or thrown
  'sonarjs/prefer-immediate-return': ERROR,
  // object literal syntax should be used
  'sonarjs/prefer-object-literal': ERROR,
  // return of boolean expressions should not be wrapped into an `if-then-else` statement
  'sonarjs/prefer-single-boolean-return': ERROR,
  // a `while` loop should be used instead of a `for` loop with condition only
  'sonarjs/prefer-while': ERROR,

  // regexp
  // disallow confusing quantifiers
  'regexp/confusing-quantifier': ERROR,
  // enforce consistent escaping of control characters
  'regexp/control-character-escape': ERROR,
  // enforce consistent usage of hexadecimal escape
  'regexp/hexadecimal-escape': [ERROR, NEVER],
  // enforce into your favorite case
  'regexp/letter-case': [ERROR, {
    caseInsensitive: 'lowercase',
    unicodeEscape: 'uppercase',
  }],
  // enforce match any character style
  'regexp/match-any': [ERROR, { allows: ['[\\S\\s]', 'dotAll'] }],
  // enforce use of escapes on negation
  'regexp/negation': ERROR,
  // disallow elements that contradict assertions
  'regexp/no-contradiction-with-assertion': ERROR,
  // disallow control characters
  'regexp/no-control-character': ERROR,
  // disallow duplicate characters in the RegExp character class
  'regexp/no-dupe-characters-character-class': ERROR,
  // disallow duplicate disjunctions
  'regexp/no-dupe-disjunctions': [ERROR, { report: 'all' }],
  // disallow alternatives without elements
  'regexp/no-empty-alternative': ERROR,
  // disallow capturing group that captures empty
  'regexp/no-empty-capturing-group': ERROR,
  // disallow character classes that match no characters
  'regexp/no-empty-character-class': ERROR,
  // disallow empty group
  'regexp/no-empty-group': ERROR,
  // disallow empty lookahead assertion or empty lookbehind assertion
  'regexp/no-empty-lookarounds-assertion': ERROR,
  // disallow escape backspace `([\b])`
  'regexp/no-escape-backspace': ERROR,
  // disallow invalid regular expression strings in RegExp constructors
  'regexp/no-invalid-regexp': ERROR,
  // disallow invisible raw character
  'regexp/no-invisible-character': ERROR,
  // disallow lazy quantifiers at the end of an expression
  'regexp/no-lazy-ends': ERROR,
  // disallow legacy RegExp features
  'regexp/no-legacy-features': ERROR,
  // disallow multi-code-point characters in character classes and quantifiers
  'regexp/no-misleading-unicode-character': ERROR,
  // disallow non-standard flags
  'regexp/no-non-standard-flag': ERROR,
  // disallow obscure character ranges
  'regexp/no-obscure-range': ERROR,
  // disallow octal escape sequence
  'regexp/no-octal': ERROR,
  // disallow optional assertions
  'regexp/no-optional-assertion': ERROR,
  // disallow backreferences that reference a group that might not be matched
  'regexp/no-potentially-useless-backreference': ERROR,
  // disallow standalone backslashes
  'regexp/no-standalone-backslash': ERROR,
  // disallow exponential and polynomial backtracking
  'regexp/no-super-linear-backtracking': ERROR,
  // disallow trivially nested assertions
  'regexp/no-trivially-nested-assertion': ERROR,
  // disallow nested quantifiers that can be rewritten as one quantifier
  'regexp/no-trivially-nested-quantifier': ERROR,
  // disallow unused capturing group
  'regexp/no-unused-capturing-group': ERROR,
  // disallow assertions that are known to always accept (or reject)
  'regexp/no-useless-assertions': ERROR,
  // disallow useless backreferences in regular expressions
  'regexp/no-useless-backreference': ERROR,
  // disallow character class with one character
  'regexp/no-useless-character-class': ERROR,
  // disallow useless `$` replacements in replacement string
  'regexp/no-useless-dollar-replacements': ERROR,
  // disallow unnecessary string escaping
  'regexp/no-useless-escape': ERROR,
  // disallow unnecessary regex flags
  'regexp/no-useless-flag': ERROR,
  //  disallow unnecessarily non-greedy quantifiers
  'regexp/no-useless-lazy': ERROR,
  // disallow unnecessary non-capturing group
  'regexp/no-useless-non-capturing-group': ERROR,
  // disallow quantifiers that can be removed
  'regexp/no-useless-quantifier': ERROR,
  // disallow unnecessary range of characters by using a hyphen
  'regexp/no-useless-range': ERROR,
  // disallow unnecessary `{n,m}`` quantifier
  'regexp/no-useless-two-nums-quantifier': ERROR,
  // disallow quantifiers with a maximum of zero
  'regexp/no-zero-quantifier': ERROR,
  // require optimal quantifiers for concatenated quantifiers
  'regexp/optimal-quantifier-concatenation': ERROR,
  // disallow the alternatives of lookarounds that end with a non-constant quantifier
  'regexp/optimal-lookaround-quantifier': ERROR,
  // enforce using character class
  'regexp/prefer-character-class': ERROR,
  // enforce using `\d`
  'regexp/prefer-d': ERROR,
  // enforces escape of replacement `$` character (`$$`)
  'regexp/prefer-escape-replacement-dollar-char': ERROR,
  // enforce using named replacement
  'regexp/prefer-named-replacement': ERROR,
  // enforce using `+` quantifier
  'regexp/prefer-plus-quantifier': ERROR,
  // enforce using quantifier
  'regexp/prefer-quantifier': ERROR,
  // enforce using `?` quantifier
  'regexp/prefer-question-quantifier': ERROR,
  // enforce using character class range
  'regexp/prefer-range': [ERROR, { target: 'alphanumeric' }],
  // enforce that `RegExp#exec` is used instead of `String#match` if no global flag is provided
  'regexp/prefer-regexp-exec': ERROR,
  //  enforce that `RegExp#test` is used instead of `String#match` and `RegExp#exec`
  'regexp/prefer-regexp-test': ERROR,
  // enforce using result array `.groups``
  'regexp/prefer-result-array-groups': ERROR,
  // enforce using `*` quantifier
  'regexp/prefer-star-quantifier': ERROR,
  // enforce use of unicode codepoint escapes
  'regexp/prefer-unicode-codepoint-escapes': ERROR,
  // enforce using `\w`
  'regexp/prefer-w': ERROR,
  // sort alternatives if order doesn't matter
  'regexp/sort-alternatives': ERROR,
  // enforces elements order in character class
  'regexp/sort-character-class-elements': ERROR,
  // require regex flags to be sorted
  'regexp/sort-flags': ERROR,
  // disallow not strictly valid regular expressions
  'regexp/strict': ERROR,
  // enforce consistent usage of unicode escape or unicode codepoint escape
  'regexp/unicode-escape': ERROR,
  // use the `i` flag if it simplifies the pattern
  'regexp/use-ignore-case': ERROR,

  // disallow function declarations in if statement clauses without using blocks
  'es-x/no-function-declarations-in-if-statement-clauses-without-block': ERROR,
  // disallow initializers in for-in heads
  'es-x/no-initializers-in-for-in': ERROR,
  // disallow \u2028 and \u2029 in string literals
  'es-x/no-json-superset': ERROR,
  // disallow labelled function declarations
  'es-x/no-labelled-function-declarations': ERROR,
  // disallow the `RegExp.prototype.compile` method
  'es-x/no-regexp-prototype-compile': ERROR,
  // disallow identifiers from shadowing catch parameter names
  'es-x/no-shadow-catch-param': ERROR,

  // eslint-comments
  // require include descriptions in eslint directive-comments
  'eslint-comments/require-description': ERROR,
};

const es3 = {
  // disallow trailing commas in multiline object literals
  'comma-dangle': [ERROR, NEVER],
  // encourages use of dot notation whenever possible
  'dot-notation': [ERROR, { allowKeywords: false }],
  // disallow function or variable declarations in nested blocks
  'no-inner-declarations': ERROR,
  // require let or const instead of var
  'no-var': OFF,
  // require or disallow method and property shorthand syntax for object literals
  'object-shorthand': OFF,
  // require using arrow functions for callbacks
  'prefer-arrow-callback': OFF,
  // require const declarations for variables that are never reassigned after declared
  'prefer-const': OFF,
  // require destructuring from arrays and/or objects
  'prefer-destructuring': OFF,
  // prefer the exponentiation operator over `Math.pow()`
  'prefer-exponentiation-operator': OFF,
  // prefer `Object.hasOwn`
  'prefer-object-has-own': OFF,
  // require template literals instead of string concatenation
  'prefer-template': OFF,
  // require or disallow use of quotes around object literal property names
  'quote-props': [ERROR, 'as-needed', { keywords: true }],
  // require strict mode directives
  strict: OFF,
  // prefer code points over char codes
  'unicorn/prefer-code-point': OFF,
  // prefer default parameters over reassignment
  'unicorn/prefer-default-parameters': OFF,
};

const forbidESAnnexBBuiltIns = {
  'es-x/no-date-prototype-getyear-setyear': ERROR,
  'es-x/no-date-prototype-togmtstring': ERROR,
  'es-x/no-escape-unescape': ERROR,
  'es-x/no-legacy-object-prototype-accessor-methods': ERROR,
  'es-x/no-string-create-html-methods': ERROR,
  'es-x/no-string-prototype-substr': ERROR,
  'es-x/no-string-prototype-trimleft-trimright': ERROR,
};

const forbidES5BuiltIns = {
  'es-x/no-array-isarray': ERROR,
  'es-x/no-array-prototype-every': ERROR,
  'es-x/no-array-prototype-filter': ERROR,
  'es-x/no-array-prototype-foreach': ERROR,
  'es-x/no-array-prototype-indexof': ERROR,
  'es-x/no-array-prototype-lastindexof': ERROR,
  'es-x/no-array-prototype-map': ERROR,
  'es-x/no-array-prototype-reduce': ERROR,
  'es-x/no-array-prototype-reduceright': ERROR,
  'es-x/no-array-prototype-some': ERROR,
  'es-x/no-date-now': ERROR,
  'es-x/no-function-prototype-bind': ERROR,
  'es-x/no-json': ERROR,
  'es-x/no-object-create': ERROR,
  'es-x/no-object-defineproperties': ERROR,
  'es-x/no-object-defineproperty': ERROR,
  'es-x/no-object-freeze': ERROR,
  'es-x/no-object-getownpropertydescriptor': ERROR,
  'es-x/no-object-getownpropertynames': ERROR,
  'es-x/no-object-getprototypeof': ERROR,
  'es-x/no-object-isextensible': ERROR,
  'es-x/no-object-isfrozen': ERROR,
  'es-x/no-object-issealed': ERROR,
  'es-x/no-object-keys': ERROR,
  'es-x/no-object-preventextensions': ERROR,
  'es-x/no-object-seal': ERROR,
  'es-x/no-string-prototype-trim': ERROR,
};

const forbidES2015BuiltIns = {
  'es-x/no-array-from': ERROR,
  'es-x/no-array-of': ERROR,
  'es-x/no-array-prototype-copywithin': ERROR,
  'es-x/no-array-prototype-entries': ERROR,
  'es-x/no-array-prototype-fill': ERROR,
  'es-x/no-array-prototype-find': ERROR,
  'es-x/no-array-prototype-findindex': ERROR,
  'es-x/no-array-prototype-keys': ERROR,
  'es-x/no-array-prototype-values': ERROR,
  'es-x/no-map': ERROR,
  'es-x/no-math-acosh': ERROR,
  'es-x/no-math-asinh': ERROR,
  'es-x/no-math-atanh': ERROR,
  'es-x/no-math-cbrt': ERROR,
  'es-x/no-math-clz32': ERROR,
  'es-x/no-math-cosh': ERROR,
  'es-x/no-math-expm1': ERROR,
  'es-x/no-math-fround': ERROR,
  'es-x/no-math-hypot': ERROR,
  'es-x/no-math-imul': ERROR,
  'es-x/no-math-log10': ERROR,
  'es-x/no-math-log1p': ERROR,
  'es-x/no-math-log2': ERROR,
  'es-x/no-math-sign': ERROR,
  'es-x/no-math-sinh': ERROR,
  'es-x/no-math-tanh': ERROR,
  'es-x/no-math-trunc': ERROR,
  'es-x/no-number-epsilon': ERROR,
  'es-x/no-number-isfinite': ERROR,
  'es-x/no-number-isinteger': ERROR,
  'es-x/no-number-isnan': ERROR,
  'es-x/no-number-issafeinteger': ERROR,
  'es-x/no-number-maxsafeinteger': ERROR,
  'es-x/no-number-minsafeinteger': ERROR,
  'es-x/no-number-parsefloat': ERROR,
  'es-x/no-number-parseint': ERROR,
  'es-x/no-object-assign': ERROR,
  'es-x/no-object-getownpropertysymbols': ERROR,
  'es-x/no-object-is': ERROR,
  'es-x/no-object-setprototypeof': ERROR,
  'es-x/no-promise': ERROR,
  'es-x/no-proxy': ERROR,
  'es-x/no-reflect': ERROR,
  'es-x/no-regexp-prototype-flags': ERROR,
  'es-x/no-set': ERROR,
  'es-x/no-string-fromcodepoint': ERROR,
  'es-x/no-string-prototype-codepointat': ERROR,
  'es-x/no-string-prototype-endswith': ERROR,
  'es-x/no-string-prototype-includes': ERROR,
  'es-x/no-string-prototype-normalize': ERROR,
  'es-x/no-string-prototype-repeat': ERROR,
  'es-x/no-string-prototype-startswith': ERROR,
  'es-x/no-string-raw': ERROR,
  'es-x/no-symbol': ERROR,
  'es-x/no-typed-arrays': ERROR,
  'es-x/no-weak-map': ERROR,
  'es-x/no-weak-set': ERROR,
};

const forbidES2016BuiltIns = {
  'es-x/no-array-prototype-includes': ERROR,
};

const forbidES2017BuiltIns = {
  'es-x/no-atomics': ERROR,
  'es-x/no-object-entries': ERROR,
  'es-x/no-object-getownpropertydescriptors': ERROR,
  'es-x/no-object-values': ERROR,
  'es-x/no-shared-array-buffer': ERROR,
  'es-x/no-string-prototype-padstart-padend': ERROR,
};

const forbidES2018BuiltIns = {
  'es-x/no-promise-prototype-finally': ERROR,
};

const forbidES2019BuiltIns = {
  'unicorn/prefer-array-flat': OFF,
  'es-x/no-array-prototype-flat': ERROR,
  'es-x/no-object-fromentries': ERROR,
  'es-x/no-string-prototype-trimstart-trimend': ERROR,
  'es-x/no-symbol-prototype-description': ERROR,
};

const forbidES2020BuiltIns = {
  'es-x/no-bigint': ERROR,
  'es-x/no-global-this': ERROR,
  'es-x/no-promise-all-settled': ERROR,
  'es-x/no-string-prototype-matchall': ERROR,
};

const forbidES2021BuiltIns = {
  'es-x/no-promise-any': ERROR,
  'es-x/no-string-prototype-replaceall': ERROR,
  'es-x/no-weakrefs': ERROR,
};

const forbidES2022BuiltIns = {
  'es-x/no-array-string-prototype-at': ERROR,
  'es-x/no-object-hasown': ERROR,
  'es-x/no-regexp-d-flag': ERROR,
};

const forbidModernESBuiltIns = {
  ...forbidESAnnexBBuiltIns,
  ...forbidES5BuiltIns,
  ...forbidES2015BuiltIns,
  ...forbidES2016BuiltIns,
  ...forbidES2017BuiltIns,
  ...forbidES2018BuiltIns,
  ...forbidES2019BuiltIns,
  ...forbidES2020BuiltIns,
  ...forbidES2021BuiltIns,
  ...forbidES2022BuiltIns,
};

const asyncAwait = {
  // prefer `async` / `await` to the callback pattern
  'promise/prefer-await-to-callbacks': ERROR,
  // prefer `await` to `then()` / `catch()` / `finally()` for reading `Promise` values
  'promise/prefer-await-to-then': ERROR,
};

const polyfills = {
  // avoid nested `then()` or `catch()` statements
  'promise/no-nesting': OFF,
};

const transpiledAndPolyfilled = {
  // disallow accessor properties
  'es-x/no-accessor-properties': ERROR,
  // disallow async functions
  'es-x/no-async-functions': ERROR,
  // disallow async iteration
  'es-x/no-async-iteration': ERROR,
  // disallow generators
  'es-x/no-generators': ERROR,
  // disallow top-level `await`
  'es-x/no-top-level-await': ERROR,
  // unpolyfillable es2015 builtins
  'es-x/no-proxy': ERROR,
  'es-x/no-string-prototype-normalize': ERROR,
  // unpolyfillable es2017 builtins
  'es-x/no-atomics': ERROR,
  'es-x/no-shared-array-buffer': ERROR,
  // unpolyfillable es2020 builtins
  'es-x/no-bigint': ERROR,
  // unpolyfillable es2021 builtins
  'es-x/no-weakrefs': ERROR,
  // prefer code points over char codes
  'unicorn/prefer-code-point': OFF,
};

const nodePackages = {
  ...asyncAwait,
  // enforces the use of `catch()` on un-returned promises
  'promise/catch-or-return': ERROR,
  // disallow unsupported ECMAScript built-ins on the specified version
  'n/no-unsupported-features/node-builtins': [ERROR, { version: SUPPORTED_NODE_VERSIONS }],
  ...disable(forbidES5BuiltIns),
  ...disable(forbidES2015BuiltIns),
  ...disable(forbidES2016BuiltIns),
  ...disable(forbidES2017BuiltIns),
  'es-x/no-atomics': ERROR,
  'es-x/no-shared-array-buffer': ERROR,
  ...forbidES2018BuiltIns,
  ...forbidES2019BuiltIns,
  ...forbidES2020BuiltIns,
  ...forbidES2021BuiltIns,
  ...forbidES2022BuiltIns,
};

const nodeDev = {
  ...asyncAwait,
  // prefer lookarounds over capturing group that do not replace
  'regexp/prefer-lookaround': ERROR,
  // disallow unsupported ECMAScript built-ins on the specified version
  'n/no-unsupported-features/node-builtins': [ERROR, { version: DEV_NODE_VERSIONS }],
  ...disable(forbidModernESBuiltIns),
  ...forbidES2021BuiltIns,
  ...forbidES2022BuiltIns,
  'es-x/no-weakrefs': OFF,
};

const tests = {
  // relax for testing:
  // enforces return statements in callbacks of array's methods
  'array-callback-return': OFF,
  // specify the maximum length of a line in your program
  'max-len': [ERROR, { ...base['max-len'][1], code: 180 }],
  // specify the maximum number of statement allowed in a function
  'max-statements': OFF,
  // disallow function declarations and expressions inside loop statements
  'no-loop-func': OFF,
  // disallow use of new operator when not part of the assignment or comparison
  'no-new': OFF,
  // disallow use of new operator for Function object
  'no-new-func': OFF,
  // disallows creating new instances of String, Number, and Boolean
  'no-new-wrappers': OFF,
  // restrict what can be thrown as an exception
  'no-throw-literal': OFF,
  // disallow usage of expressions in statement position
  'no-unused-expressions': OFF,
  // disallow unnecessary calls to `.call()` and `.apply()`
  'no-useless-call': OFF,
  // enforce passing a message value when throwing a built-in error
  'unicorn/error-message': OFF,
  // functions should not have identical implementations
  'sonarjs/no-identical-functions': OFF,
  // allow Annex B methods for testing
  ...disable(forbidESAnnexBBuiltIns),
};

const qunit = {
  // ensure the correct number of assert arguments is used
  'qunit/assert-args': ERROR,
  // enforce comparison assertions have arguments in the right order
  'qunit/literal-compare-order': ERROR,
  // forbid the use of assert.equal
  'qunit/no-assert-equal': ERROR,
  // require use of boolean assertions
  'qunit/no-assert-equal-boolean': ERROR,
  // disallow binary logical expressions in assert arguments
  'qunit/no-assert-logical-expression': ERROR,
  // forbid async calls in loops
  'qunit/no-async-in-loops': ERROR,
  // disallow async module callbacks
  'qunit/no-async-module-callbacks': ERROR,
  // forbid the use of asyncTest
  'qunit/no-async-test': ERROR,
  // disallow the use of hooks from ancestor modules
  'qunit/no-hooks-from-ancestor-modules': ERROR,
  // forbid commented tests
  'qunit/no-commented-tests': ERROR,
  // forbid comparing relational expression to boolean in assertions
  'qunit/no-compare-relation-boolean': ERROR,
  // prevent early return in a qunit test
  'qunit/no-early-return': ERROR,
  // forbid the use of global qunit assertions
  'qunit/no-global-assertions': ERROR,
  // forbid the use of global expect
  'qunit/no-global-expect': ERROR,
  // forbid the use of global module / test / asyncTest
  'qunit/no-global-module-test': ERROR,
  // forbid use of global stop / start
  'qunit/no-global-stop-start': ERROR,
  // forbid identical test and module names
  'qunit/no-identical-names': ERROR,
  // forbid use of QUnit.init
  'qunit/no-init': ERROR,
  // forbid use of QUnit.jsDump
  'qunit/no-jsdump': ERROR,
  // disallow the use of `assert.equal` / `assert.ok` / `assert.notEqual` / `assert.notOk``
  'qunit/no-loose-assertions': ERROR,
  // forbid QUnit.test() calls inside callback of another QUnit.test
  'qunit/no-nested-tests': ERROR,
  // forbid equality comparisons in assert.{ok, notOk}
  'qunit/no-ok-equality': ERROR,
  // forbid the use of QUnit.push
  'qunit/no-qunit-push': ERROR,
  // forbid QUnit.start within tests or test hooks
  'qunit/no-qunit-start-in-tests': ERROR,
  // forbid the use of QUnit.stop
  'qunit/no-qunit-stop': ERROR,
  // forbid overwriting of QUnit logging callbacks
  'qunit/no-reassign-log-callbacks': ERROR,
  // forbid use of QUnit.reset
  'qunit/no-reset': ERROR,
  // forbid setup / teardown module hooks
  'qunit/no-setup-teardown': ERROR,
  // forbid expect argument in QUnit.test
  'qunit/no-test-expect-argument': ERROR,
  // forbid assert.throws() with block, string, and message
  'qunit/no-throws-string': ERROR,
  // enforce use of objects as expected value in `assert.propEqual`
  'qunit/require-object-in-propequal': ERROR,
  // require that all async calls should be resolved in tests
  'qunit/resolve-async': ERROR,
};

const json = {
  // enforce spacing inside array brackets
  'jsonc/array-bracket-spacing': [ERROR, NEVER],
  // disallow trailing commas in multiline object literals
  'jsonc/comma-dangle': [ERROR, NEVER],
  // enforce one true comma style
  'jsonc/comma-style': [ERROR, 'last'],
  // enforce consistent indentation
  'jsonc/indent': [ERROR, 2],
  // enforces spacing between keys and values in object literal properties
  'jsonc/key-spacing': [ERROR, { beforeColon: false, afterColon: true }],
  // disallow BigInt literals
  'jsonc/no-bigint-literals': ERROR,
  // disallow comments
  'jsonc/no-comments': ERROR,
  // disallow duplicate keys when creating object literals
  'jsonc/no-dupe-keys': ERROR,
  // disallow escape sequences in identifiers.
  'jsonc/no-escape-sequence-in-identifier': ERROR,
  // disallow use of multiline strings
  'jsonc/no-multi-str': ERROR,
  // disallow number property keys
  'jsonc/no-number-props': ERROR,
  // disallow use of octal escape sequences in string literals, such as var foo = 'Copyright \251';
  'jsonc/no-octal-escape': ERROR,
  // disallow RegExp literals
  'jsonc/no-regexp-literals': ERROR,
  // disallow sparse arrays
  'jsonc/no-sparse-arrays': ERROR,
  // disallow template literals
  'jsonc/no-template-literals': ERROR,
  // disallow `undefined`
  'jsonc/no-undefined-value': ERROR,
  // disallow Unicode code point escape sequences.
  'jsonc/no-unicode-codepoint-escapes': ERROR,
  // disallow unnecessary string escaping
  'jsonc/no-useless-escape': ERROR,
  // enforce consistent line breaks after opening and before closing braces
  'jsonc/object-curly-newline': [ERROR, { consistent: true }],
  // enforce spaces inside braces
  'jsonc/object-curly-spacing': [ERROR, ALWAYS],
  // require or disallow use of quotes around object literal property names
  'jsonc/quote-props': [ERROR, ALWAYS],
  // specify whether double or single quotes should be used
  'jsonc/quotes': [ERROR, 'double'],
  // require or disallow spaces before/after unary operators
  'jsonc/space-unary-ops': ERROR,
  // disallow invalid number for JSON
  'jsonc/valid-json-number': ERROR,
  // specify the maximum length of a line in your program
  'max-len': [ERROR, { ...base['max-len'][1], code: 180 }],
  // require strict mode directives
  strict: OFF,
};

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script',
  },
  env: {
    // unnecessary global builtins disabled by related rules
    es2021: true,
    browser: true,
    node: true,
    worker: true,
  },
  plugins: [
    'array-func',
    'es-x',
    'eslint-comments',
    'import',
    'jsonc',
    'n',
    'promise',
    'qunit',
    'regexp',
    'sonarjs',
    'unicorn',
  ],
  reportUnusedDisableDirectives: true,
  rules: {
    ...base,
    ...forbidESAnnexBBuiltIns,
  },
  overrides: [
    {
      files: [
        'packages/core-js/**',
        'packages/core-js-pure/**',
        'tests/compat/**',
        'tests/worker/**',
      ],
      parserOptions: {
        ecmaVersion: 3,
      },
      rules: es3,
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
        'packages/core-js/**',
        'packages/core-js-pure/**',
      ],
      rules: polyfills,
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
        'tests/compat/deno-runner.mjs',
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
        AsyncIterator: READONLY,
        Iterator: READONLY,
        Observable: READONLY,
        compositeKey: READONLY,
        compositeSymbol: READONLY,
        structuredClone: READONLY,
      },
    },
    {
      files: ['*.mjs'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    {
      files: [
        'scripts/**',
        'tests/*.mjs',
      ],
      // zx
      globals: {
        $: READONLY,
        __dirname: READONLY,
        __filename: READONLY,
        argv: READONLY,
        cd: READONLY,
        chalk: READONLY,
        fetch: READONLY,
        fs: READONLY,
        globby: READONLY,
        nothrow: READONLY,
        os: READONLY,
        question: READONLY,
        require: READONLY,
        sleep: READONLY,
      },
      rules: {
        // disallow use of console
        'no-console': OFF,
      },
    },
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',
      rules: json,
    },
  ],
};
