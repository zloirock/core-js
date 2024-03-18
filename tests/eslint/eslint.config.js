import globals from 'globals';
import confusingBrowserGlobals from 'confusing-browser-globals';
import parserJSONC from 'jsonc-eslint-parser';
import pluginArrayFunc from 'eslint-plugin-array-func';
import pluginESX from 'eslint-plugin-es-x';
import pluginESlintComments from '@eslint-community/eslint-plugin-eslint-comments';
import pluginFilenames from 'eslint-plugin-filenames';
import pluginImport from 'eslint-plugin-import-x';
import pluginJSONC from 'eslint-plugin-jsonc';
import pluginN from 'eslint-plugin-n';
import pluginPromise from 'eslint-plugin-promise';
import pluginQUnit from 'eslint-plugin-qunit';
import pluginReDoS from 'eslint-plugin-redos';
import pluginRegExp from 'eslint-plugin-regexp';
import pluginSonarJS from 'eslint-plugin-sonarjs';
import pluginStylisticJS from '@stylistic/eslint-plugin-js';
import pluginUnicorn from 'eslint-plugin-unicorn';

const PACKAGES_NODE_VERSIONS = '8.9.0';
const DEV_NODE_VERSIONS = '^18.12';

const ERROR = 'error';
const OFF = 'off';
const ALWAYS = 'always';
const NEVER = 'never';
const READONLY = 'readonly';

function disable(rules) {
  return Object.fromEntries(Object.keys(rules).map(key => [key, OFF]));
}

const base = {
  // possible problems:
  // enforces return statements in callbacks of array's methods
  'array-callback-return': ERROR,
  // require `super()` calls in constructors
  'constructor-super': ERROR,
  // enforce 'for' loop update clause moving the counter in the right direction
  'for-direction': ERROR,
  // disallow using an async function as a `Promise` executor
  'no-async-promise-executor': ERROR,
  // disallow reassigning class members
  'no-class-assign': ERROR,
  // disallow comparing against -0
  'no-compare-neg-zero': ERROR,
  // disallow reassigning `const` variables
  'no-const-assign': ERROR,
  // disallows expressions where the operation doesn't affect the value
  'no-constant-binary-expression': ERROR,
  // disallow constant expressions in conditions
  'no-constant-condition': [ERROR, { checkLoops: false }],
  // disallow returning value from constructor
  'no-constructor-return': ERROR,
  // disallow use of debugger
  'no-debugger': ERROR,
  // disallow duplicate arguments in functions
  'no-dupe-args': ERROR,
  // disallow duplicate class members
  'no-dupe-class-members': ERROR,
  // disallow duplicate conditions in if-else-if chains
  'no-dupe-else-if': ERROR,
  // disallow duplicate keys when creating object literals
  'no-dupe-keys': ERROR,
  // disallow a duplicate case label
  'no-duplicate-case': ERROR,
  // disallow duplicate module imports
  'no-duplicate-imports': ERROR,
  // disallow empty destructuring patterns
  'no-empty-pattern': ERROR,
  // disallow assigning to the exception in a catch block
  'no-ex-assign': ERROR,
  // disallow fallthrough of case statements
  'no-fallthrough': [ERROR, { commentPattern: 'break omitted' }],
  // disallow overwriting functions written as function declarations
  'no-func-assign': ERROR,
  // disallow assigning to imported bindings
  'no-import-assign': ERROR,
  // disallow irregular whitespace outside of strings and comments
  'no-irregular-whitespace': ERROR,
  // disallow literal numbers that lose precision
  'no-loss-of-precision': ERROR,
  // disallow `new` operators with global non-constructor functions
  'no-new-native-nonconstructor': ERROR,
  // disallow the use of object properties of the global object (Math and JSON) as functions
  'no-obj-calls': ERROR,
  // disallow use of Object.prototypes builtins directly
  'no-prototype-builtins': ERROR,
  // disallow self assignment
  'no-self-assign': ERROR,
  // disallow comparisons where both sides are exactly the same
  'no-self-compare': ERROR,
  // disallow sparse arrays
  'no-sparse-arrays': ERROR,
  // disallow template literal placeholder syntax in regular strings
  'no-template-curly-in-string': ERROR,
  // disallow `this` / `super` before calling `super()` in constructors
  'no-this-before-super': ERROR,
  // disallow unmodified loop conditions
  'no-unmodified-loop-condition': ERROR,
  // disallow use of undeclared variables unless mentioned in a /*global */ block
  'no-undef': [ERROR, { typeof: false }],
  // disallow control flow statements in `finally` blocks
  'no-unsafe-finally': ERROR,
  // avoid code that looks like two expressions but is actually one
  'no-unexpected-multiline': ERROR,
  // disallow unreachable statements after a return, throw, continue, or break statement
  'no-unreachable': ERROR,
  // disallow loops with a body that allows only one iteration
  'no-unreachable-loop': ERROR,
  // disallow negation of the left operand of an in expression
  'no-unsafe-negation': ERROR,
  // disallow use of optional chaining in contexts where the `undefined` value is not allowed
  'no-unsafe-optional-chaining': ERROR,
  // disallow unused private class members
  'no-unused-private-class-members': ERROR,
  // disallow declaration of variables that are not used in the code
  'no-unused-vars': [ERROR, {
    vars: 'all',
    args: 'after-used',
    ignoreRestSiblings: true,
  }],
  // require or disallow the Unicode Byte Order Mark
  'unicode-bom': [ERROR, NEVER],
  // disallow comparisons with the value NaN
  'use-isnan': ERROR,
  // ensure that the results of typeof are compared against a valid string
  'valid-typeof': ERROR,

  // suggestions:
  // enforce the use of variables within the scope they are defined
  'block-scoped-var': ERROR,
  // require camel case names
  camelcase: [ERROR, { properties: NEVER }],
  // enforce default clauses in switch statements to be last
  'default-case-last': ERROR,
  // enforce default parameters to be last
  'default-param-last': ERROR,
  // encourages use of dot notation whenever possible
  'dot-notation': [ERROR, { allowKeywords: true }],
  // require the use of === and !==
  eqeqeq: [ERROR, 'smart'],
  // require grouped accessor pairs in object literals and classes
  'grouped-accessor-pairs': [ERROR, 'getBeforeSet'],
  // require logical assignment operator shorthand
  'logical-assignment-operators': [ERROR, ALWAYS],
  // enforce a maximum depth that blocks can be nested
  'max-depth': [ERROR, { max: 5 }],
  // enforce a maximum depth that callbacks can be nested
  'max-nested-callbacks': [ERROR, { max: 4 }],
  // specify the maximum number of statement allowed in a function
  'max-statements': [ERROR, { max: 50 }],
  // require a capital letter for constructors
  'new-cap': [ERROR, { newIsCap: true, capIsNew: false }],
  // disallow window alert / confirm / prompt calls
  'no-alert': ERROR,
  // disallow use of arguments.caller or arguments.callee
  'no-caller': ERROR,
  // disallow lexical declarations in case/default clauses
  'no-case-declarations': ERROR,
  // disallow use of console
  'no-console': ERROR,
  // disallow deletion of variables
  'no-delete-var': ERROR,
  // disallow else after a return in an if
  'no-else-return': ERROR,
  // disallow empty statements
  'no-empty': ERROR,
  // disallow empty functions, except for standalone funcs/arrows
  'no-empty-function': ERROR,
  // disallow empty static blocks
  'no-empty-static-block': ERROR,
  // disallow `null` comparisons without type-checking operators
  'no-eq-null': ERROR,
  // disallow use of eval()
  'no-eval': ERROR,
  // disallow adding to native types
  'no-extend-native': ERROR,
  // disallow unnecessary function binding
  'no-extra-bind': ERROR,
  // disallow unnecessary boolean casts
  'no-extra-boolean-cast': ERROR,
  // disallow unnecessary labels
  'no-extra-label': ERROR,
  // disallow reassignments of native objects
  'no-global-assign': ERROR,
  // disallow use of eval()-like methods
  'no-implied-eval': ERROR,
  // disallow usage of __iterator__ property
  'no-iterator': ERROR,
  // disallow labels that share a name with a variable
  'no-label-var': ERROR,
  // disallow use of labels for anything other then loops and switches
  'no-labels': [ERROR, { allowLoop: false, allowSwitch: false }],
  // disallow unnecessary nested blocks
  'no-lone-blocks': ERROR,
  // disallow `if` as the only statement in an `else` block
  'no-lonely-if': ERROR,
  // disallow function declarations and expressions inside loop statements
  'no-loop-func': OFF,
  // disallow use of multiline strings
  'no-multi-str': ERROR,
  // disallow use of new operator when not part of the assignment or comparison
  'no-new': ERROR,
  // disallow use of new operator for Function object
  'no-new-func': ERROR,
  // disallows creating new instances of String, Number, and Boolean
  'no-new-wrappers': ERROR,
  // disallow `\8` and `\9` escape sequences in string literals
  'no-nonoctal-decimal-escape': ERROR,
  // disallow calls to the `Object` constructor without an argument
  'no-object-constructor': ERROR,
  // disallow use of (old style) octal literals
  'no-octal': ERROR,
  // disallow use of octal escape sequences in string literals, such as var foo = 'Copyright \251';
  'no-octal-escape': ERROR,
  // disallow usage of __proto__ property
  'no-proto': ERROR,
  // disallow declaring the same variable more then once
  'no-redeclare': [ERROR, { builtinGlobals: false }],
  // disallow specific global variables
  'no-restricted-globals': [ERROR, ...confusingBrowserGlobals],
  // disallow specified syntax
  'no-restricted-syntax': [ERROR,
    {
      selector: 'ForInStatement',
      message: '`for-in` loops are disallowed since iterate over the prototype chain',
    },
  ],
  // disallow use of `javascript:` urls.
  'no-script-url': ERROR,
  // disallow use of comma operator
  'no-sequences': ERROR,
  // disallow declaration of variables already declared in the outer scope
  'no-shadow': ERROR,
  // disallow shadowing of names such as arguments
  'no-shadow-restricted-names': ERROR,
  // restrict what can be thrown as an exception
  'no-throw-literal': ERROR,
  // disallow initializing variables to `undefined`
  'no-undef-init': ERROR,
  // disallow dangling underscores in identifiers
  'no-underscore-dangle': ERROR,
  // disallow the use of boolean literals in conditional expressions and prefer `a || b` over `a ? a : b`
  'no-unneeded-ternary': [ERROR, { defaultAssignment: false }],
  // disallow usage of expressions in statement position
  'no-unused-expressions': [ERROR, {
    allowShortCircuit: true,
    allowTernary: true,
    allowTaggedTemplates: true,
  }],
  // disallow unused labels
  'no-unused-labels': ERROR,
  // disallow unnecessary calls to `.call()` and `.apply()`
  'no-useless-call': ERROR,
  // disallow unnecessary catch clauses
  'no-useless-catch': ERROR,
  // disallow unnecessary computed property keys in object literals
  'no-useless-computed-key': ERROR,
  // disallow useless string concatenation
  'no-useless-concat': ERROR,
  // disallow unnecessary constructors
  'no-useless-constructor': ERROR,
  // disallow unnecessary escape characters
  'no-useless-escape': ERROR,
  // disallow renaming import, export, and destructured assignments to the same name
  'no-useless-rename': ERROR,
  // disallow redundant return statements
  'no-useless-return': ERROR,
  // require let or const instead of var
  'no-var': ERROR,
  // disallow void operators
  'no-void': ERROR,
  // disallow use of the with statement
  'no-with': ERROR,
  // require or disallow method and property shorthand syntax for object literals
  'object-shorthand': ERROR,
  // require assignment operator shorthand where possible
  'operator-assignment': [ERROR, 'always'],
  // require using arrow functions for callbacks
  'prefer-arrow-callback': ERROR,
  // require const declarations for variables that are never reassigned after declared
  'prefer-const': [ERROR, { destructuring: 'all' }],
  // require destructuring from arrays and/or objects
  'prefer-destructuring': ERROR,
  // prefer the exponentiation operator over `Math.pow()`
  'prefer-exponentiation-operator': ERROR,
  // disallow `parseInt()` and `Number.parseInt()` in favor of binary, octal, and hexadecimal literals
  'prefer-numeric-literals': ERROR,
  // prefer `Object.hasOwn`
  'prefer-object-has-own': ERROR,
  // disallow use of the `RegExp` constructor in favor of regular expression literals
  'prefer-regex-literals': [ERROR, { disallowRedundantWrapping: true }],
  // require rest parameters instead of `arguments`
  'prefer-rest-params': ERROR,
  // require spread operators instead of `.apply()`
  'prefer-spread': ERROR,
  // require template literals instead of string concatenation
  'prefer-template': ERROR,
  // require use of the second argument for parseInt()
  radix: ERROR,
  // disallow generator functions that do not have `yield`
  'require-yield': ERROR,
  // require strict mode directives
  strict: [ERROR, 'global'],
  // require symbol descriptions
  'symbol-description': ERROR,
  // disallow "Yoda" conditions
  yoda: [ERROR, NEVER],

  // layout & formatting:
  // enforce spacing inside array brackets
  '@stylistic/js/array-bracket-spacing': [ERROR, NEVER],
  // require parentheses around arrow function arguments
  '@stylistic/js/arrow-parens': [ERROR, 'as-needed'],
  // enforce consistent spacing before and after the arrow in arrow functions
  '@stylistic/js/arrow-spacing': ERROR,
  // enforce spacing inside single-line blocks
  '@stylistic/js/block-spacing': [ERROR, ALWAYS],
  // enforce one true brace style
  '@stylistic/js/brace-style': [ERROR, '1tbs', { allowSingleLine: true }],
  // enforce trailing commas in multiline object literals
  '@stylistic/js/comma-dangle': [ERROR, 'always-multiline'],
  // enforce spacing after comma
  '@stylistic/js/comma-spacing': ERROR,
  // enforce one true comma style
  '@stylistic/js/comma-style': [ERROR, 'last'],
  // disallow padding inside computed properties
  '@stylistic/js/computed-property-spacing': [ERROR, NEVER],
  // enforce newline before and after dot
  '@stylistic/js/dot-location': [ERROR, 'property'],
  // enforce one newline at the end of files
  '@stylistic/js/eol-last': [ERROR, ALWAYS],
  // disallow space between function identifier and application
  '@stylistic/js/function-call-spacing': ERROR,
  // require spacing around the `*` in `function *` expressions
  '@stylistic/js/generator-star-spacing': [ERROR, 'both'],
  // enforce the location of arrow function bodies
  '@stylistic/js/implicit-arrow-linebreak': [ERROR, 'beside'],
  // enforce consistent indentation
  '@stylistic/js/indent': [ERROR, 2, {
    ignoredNodes: ['ConditionalExpression'],
    SwitchCase: 1,
    VariableDeclarator: 'first',
  }],
  // enforces spacing between keys and values in object literal properties
  '@stylistic/js/key-spacing': [ERROR, { beforeColon: false, afterColon: true }],
  // require a space before & after certain keywords
  '@stylistic/js/keyword-spacing': [ERROR, { before: true, after: true }],
  // enforce consistent linebreak style
  '@stylistic/js/linebreak-style': [ERROR, 'unix'],
  // specify the maximum length of a line in your program
  '@stylistic/js/max-len': [ERROR, {
    code: 140,
    tabWidth: 2,
    ignoreRegExpLiterals: true,
    ignoreTemplateLiterals: true,
    ignoreUrls: true,
  }],
  // enforce a maximum number of statements allowed per line
  '@stylistic/js/max-statements-per-line': [ERROR, { max: 2 }],
  // require parentheses when invoking a constructor with no arguments
  '@stylistic/js/new-parens': ERROR,
  // disallow unnecessary semicolons
  '@stylistic/js/no-extra-semi': ERROR,
  // disallow the use of leading or trailing decimal points in numeric literals
  '@stylistic/js/no-floating-decimal': ERROR,
  // disallow mixed spaces and tabs for indentation
  '@stylistic/js/no-mixed-spaces-and-tabs': ERROR,
  // disallow use of multiple spaces
  '@stylistic/js/no-multi-spaces': [ERROR, { ignoreEOLComments: true }],
  // disallow multiple empty lines and only one newline at the end
  '@stylistic/js/no-multiple-empty-lines': [ERROR, { max: 1, maxEOF: 1 }],
  // disallow tabs
  '@stylistic/js/no-tabs': ERROR,
  // disallow trailing whitespace at the end of lines
  '@stylistic/js/no-trailing-spaces': ERROR,
  // disallow whitespace before properties
  '@stylistic/js/no-whitespace-before-property': ERROR,
  // enforce the location of single-line statements
  '@stylistic/js/nonblock-statement-body-position': [ERROR, 'beside'],
  // enforce consistent line breaks after opening and before closing braces
  '@stylistic/js/object-curly-newline': [ERROR, { consistent: true }],
  // enforce spaces inside braces
  '@stylistic/js/object-curly-spacing': [ERROR, ALWAYS],
  // require newlines around variable declarations with initializations
  '@stylistic/js/one-var-declaration-per-line': [ERROR, 'initializations'],
  // enforce padding within blocks
  '@stylistic/js/padded-blocks': [ERROR, NEVER],
  // disallow blank lines after 'use strict'
  '@stylistic/js/padding-line-between-statements': [ERROR, { blankLine: NEVER, prev: 'directive', next: '*' }],
  // require or disallow use of quotes around object literal property names
  '@stylistic/js/quote-props': [ERROR, 'as-needed', { keywords: false }],
  // specify whether double or single quotes should be used
  '@stylistic/js/quotes': [ERROR, 'single', { avoidEscape: true }],
  // enforce spacing between rest and spread operators and their expressions
  '@stylistic/js/rest-spread-spacing': ERROR,
  // require or disallow use of semicolons instead of ASI
  '@stylistic/js/semi': [ERROR, ALWAYS],
  // enforce spacing before and after semicolons
  '@stylistic/js/semi-spacing': ERROR,
  // enforce location of semicolons
  '@stylistic/js/semi-style': [ERROR, 'last'],
  // require or disallow space before blocks
  '@stylistic/js/space-before-blocks': ERROR,
  // require or disallow space before function opening parenthesis
  '@stylistic/js/space-before-function-paren': [ERROR, { anonymous: ALWAYS, named: NEVER }],
  // require or disallow spaces inside parentheses
  '@stylistic/js/space-in-parens': ERROR,
  // require spaces around operators
  '@stylistic/js/space-infix-ops': ERROR,
  // require or disallow spaces before/after unary operators
  '@stylistic/js/space-unary-ops': ERROR,
  // require or disallow a space immediately following the // or /* in a comment
  '@stylistic/js/spaced-comment': [ERROR, ALWAYS, {
    line: { exceptions: ['/'] },
    block: { exceptions: ['*'] },
  }],
  // enforce spacing around colons of switch statements
  '@stylistic/js/switch-colon-spacing': ERROR,
  // require or disallow spacing around embedded expressions of template strings
  '@stylistic/js/template-curly-spacing': [ERROR, ALWAYS],
  // disallow spacing between template tags and their literals
  '@stylistic/js/template-tag-spacing': [ERROR, NEVER],
  // require spacing around the `*` in `yield *` expressions
  '@stylistic/js/yield-star-spacing': [ERROR, 'both'],

  // import:
  // ensure all imports appear before other statements
  'import/first': ERROR,
  // enforce a newline after import statements
  'import/newline-after-import': ERROR,
  // forbid import of modules using absolute paths
  'import/no-absolute-path': ERROR,
  // forbid AMD imports
  'import/no-amd': ERROR,
  // forbid cycle dependencies
  'import/no-cycle': [ERROR, { commonjs: true }],
  // disallow importing from the same path more than once
  'import/no-duplicates': ERROR,
  // forbid `require()` calls with expressions
  'import/no-dynamic-require': ERROR,
  // forbid empty named import blocks
  'import/no-empty-named-blocks': ERROR,
  // forbid imports with CommonJS exports
  'import/no-import-module-exports': ERROR,
  // forbid a module from importing itself
  'import/no-self-import': ERROR,
  // ensure imports point to files / modules that can be resolved
  'import/no-unresolved': [ERROR, { commonjs: true }],
  // forbid useless path segments
  'import/no-useless-path-segments': ERROR,

  // node:
  // enforce the style of file extensions in `import` declarations
  'node/file-extension-in-import': ERROR,
  // require require() calls to be placed at top-level module scope
  'node/global-require': ERROR,
  // disallow deprecated APIs
  'node/no-deprecated-api': ERROR,
  // disallow the assignment to `exports`
  'node/no-exports-assign': ERROR,
  // disallow third-party modules which are hiding core modules
  'node/no-hide-core-modules': ERROR,
  // disallow require calls to be mixed with regular variable declarations
  'node/no-mixed-requires': [ERROR, { grouping: true, allowCall: false }],
  // disallow new operators with calls to require
  'node/no-new-require': ERROR,
  // disallow string concatenation with `__dirname` and `__filename`
  'node/no-path-concat': ERROR,
  // disallow the use of `process.exit()`
  'node/no-process-exit': ERROR,
  // disallow synchronous methods
  'node/no-sync': ERROR,
  // prefer `node:` protocol
  'node/prefer-node-protocol': ERROR,
  // prefer global
  'node/prefer-global/buffer': [ERROR, ALWAYS],
  'node/prefer-global/console': [ERROR, ALWAYS],
  'node/prefer-global/process': [ERROR, ALWAYS],
  'node/prefer-global/text-decoder': [ERROR, ALWAYS],
  'node/prefer-global/text-encoder': [ERROR, ALWAYS],
  'node/prefer-global/url-search-params': [ERROR, ALWAYS],
  'node/prefer-global/url': [ERROR, ALWAYS],
  // prefer promises
  'node/prefer-promises/dns': ERROR,
  'node/prefer-promises/fs': ERROR,

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
  // disallow creating new promises with paths that resolve multiple times (no-multiple-resolved)
  'promise/no-multiple-resolved': ERROR,
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
  'promise/param-names': [ERROR, {
    resolvePattern: '^resolve',
    rejectPattern: '^reject',
  }],
  // prefer `async` / `await` to the callback pattern
  'promise/prefer-await-to-callbacks': ERROR,
  // prefer `await` to `then()` / `catch()` / `finally()` for reading `Promise` values
  'promise/prefer-await-to-then': ERROR,
  // ensures the proper number of arguments are passed to `Promise` functions
  'promise/valid-params': ERROR,

  // unicorn
  // enforce a specific parameter name in `catch` clauses
  'unicorn/catch-error-name': [ERROR, { name: ERROR, ignore: [/^err/] }],
  // enforce correct `Error` subclassing
  'unicorn/custom-error-definition': ERROR,
  // enforce passing a message value when throwing a built-in error
  'unicorn/error-message': ERROR,
  // require escape sequences to use uppercase values
  'unicorn/escape-case': ERROR,
  // enforce a case style for filenames
  'unicorn/filename-case': [ERROR, { case: 'kebabCase' }],
  // enforce specifying rules to disable in `eslint-disable` comments
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
  // enforce the use of `Buffer.from()` and `Buffer.alloc()` instead of the deprecated `new Buffer()`
  'unicorn/no-new-buffer': ERROR,
  // forbid classes that only have static members
  'unicorn/no-static-only-class': ERROR,
  // disallow `then` property
  'unicorn/no-thenable': ERROR,
  // disallow comparing `undefined` using `typeof` when it's not required
  'unicorn/no-typeof-undefined': ERROR,
  // disallow awaiting non-promise values
  'unicorn/no-unnecessary-await': ERROR,
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
  // disallow useless `case` in `switch` statements
  'unicorn/no-useless-switch-case': ERROR,
  // enforce lowercase identifier and uppercase value for number literals
  'unicorn/number-literal-case': ERROR,
  // enforce the style of numeric separators by correctly grouping digits
  'unicorn/numeric-separators-style': [ERROR, {
    onlyIfContainsSeparator: true,
    number: { minimumDigits: 0, groupLength: 3 },
    binary: { minimumDigits: 0, groupLength: 4 },
    octal: { minimumDigits: 0, groupLength: 4 },
    hexadecimal: { minimumDigits: 0, groupLength: 2 },
  }],
  // prefer `.find()` over the first element from `.filter()`
  'unicorn/prefer-array-find': ERROR,
  // use `.flat()` to flatten an array of arrays
  'unicorn/prefer-array-flat': ERROR,
  // use `.flatMap()` to map and then flatten an array instead of using `.map().flat()`
  'unicorn/prefer-array-flat-map': ERROR,
  // prefer `Array#indexOf` over `Array#findIndex`` when looking for the index of an item
  'unicorn/prefer-array-index-of': ERROR,
  // prefer `.some()` over `.filter().length` check and `.find()`
  'unicorn/prefer-array-some': ERROR,
  // prefer `.at()` method for index access and `String#charAt()`
  'unicorn/prefer-at': [ERROR, { checkAllIndexAccess: false }],
  // prefer `Blob#{ arrayBuffer, text }` over `FileReader#{ readAsArrayBuffer, readAsText }`
  'unicorn/prefer-blob-reading-methods': ERROR,
  // prefer `Date.now()` to get the number of milliseconds since the Unix Epoch
  'unicorn/prefer-date-now': ERROR,
  // prefer default parameters over reassignment
  'unicorn/prefer-default-parameters': ERROR,
  // prefer `EventTarget` over `EventEmitter`
  'unicorn/prefer-event-target': ERROR,
  // prefer `.includes()` over `.indexOf()` and `Array#some()` when checking for existence or non-existence
  'unicorn/prefer-includes': ERROR,
  // prefer reading a `JSON` file as a buffer
  'unicorn/prefer-json-parse-buffer': ERROR,
  // prefer using a logical operator over a ternary
  'unicorn/prefer-logical-operator-over-ternary': ERROR,
  // prefer modern `Math` APIs over legacy patterns
  'unicorn/prefer-modern-math-apis': ERROR,
  // prefer negative index over `.length - index` when possible
  'unicorn/prefer-negative-index': ERROR,
  // prefer using the `node:` protocol when importing Node builtin modules
  'unicorn/prefer-node-protocol': ERROR,
  // prefer using `Object.fromEntries()` to transform a list of key-value pairs into an object
  'unicorn/prefer-object-from-entries': ERROR,
  // prefer omitting the `catch` binding parameter
  'unicorn/prefer-optional-catch-binding': ERROR,
  // prefer using `Set#size` instead of `Array#length`
  'unicorn/prefer-set-size': ERROR,
  // prefer `String#replaceAll()` over regex searches with the global flag
  'unicorn/prefer-string-replace-all': ERROR,
  // prefer `String#{ startsWith, endsWith }()` over `RegExp#test()`
  'unicorn/prefer-string-starts-ends-with': ERROR,
  // prefer `String#{ trimStart, trimEnd }()` over `String#{ trimLeft, trimRight }()`
  'unicorn/prefer-string-trim-start-end': ERROR,
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
  // forbid braces for case clauses
  'unicorn/switch-case-braces': [ERROR, 'avoid'],
  // fix whitespace-insensitive template indentation
  'unicorn/template-indent': OFF, // waiting for `String.dedent`
  // enforce consistent case for text encoding identifiers
  'unicorn/text-encoding-identifier-case': ERROR,
  // require `new` when throwing an error
  'unicorn/throw-new-error': ERROR,

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
  // boolean literals should not be redundant
  'sonarjs/no-redundant-boolean': ERROR,
  // jump statements should not be redundant
  'sonarjs/no-redundant-jump': ERROR,
  // conditionals should start on new lines
  'sonarjs/no-same-line-conditional': ERROR,
  // `switch` statements should have at least 3 `case` clauses
  'sonarjs/no-small-switch': ERROR,
  // collection and array contents should be used
  'sonarjs/no-unused-collection': ERROR,
  // the output of functions that don't return anything should not be used
  'sonarjs/no-use-of-empty-return-value': ERROR,
  // non-existent operators `=+`, `=-` and `=!` should not be used
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
  // enforce single grapheme in string literal
  'regexp/grapheme-string-literal': ERROR,
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
  // reports empty string literals in character classes
  'regexp/no-empty-string-literal': ERROR,
  // disallow escape backspace `([\b])`
  'regexp/no-escape-backspace': ERROR,
  // disallow unnecessary nested lookaround assertions
  'regexp/no-extra-lookaround-assertions': ERROR,
  // disallow invalid regular expression strings in RegExp constructors
  'regexp/no-invalid-regexp': ERROR,
  // disallow invisible raw character
  'regexp/no-invisible-character': ERROR,
  // disallow lazy quantifiers at the end of an expression
  'regexp/no-lazy-ends': ERROR,
  // disallow legacy RegExp features
  'regexp/no-legacy-features': ERROR,
  // disallow capturing groups that do not behave as one would expect
  'regexp/no-misleading-capturing-group': ERROR,
  // disallow multi-code-point characters in character classes and quantifiers
  'regexp/no-misleading-unicode-character': ERROR,
  // disallow missing `g` flag in patterns used in `String#matchAll` and `String#replaceAll`
  'regexp/no-missing-g-flag': ERROR,
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
  // reports any unnecessary set operands
  'regexp/no-useless-set-operand': ERROR,
  // reports the string alternatives of a single character in `\q{...}`, it can be placed outside `\q{...}`
  'regexp/no-useless-string-literal': ERROR,
  // disallow unnecessary `{n,m}`` quantifier
  'regexp/no-useless-two-nums-quantifier': ERROR,
  // disallow quantifiers with a maximum of zero
  'regexp/no-zero-quantifier': ERROR,
  // disallow the alternatives of lookarounds that end with a non-constant quantifier
  'regexp/optimal-lookaround-quantifier': ERROR,
  // require optimal quantifiers for concatenated quantifiers
  'regexp/optimal-quantifier-concatenation': ERROR,
  // enforce using character class
  'regexp/prefer-character-class': ERROR,
  // enforce using `\d`
  'regexp/prefer-d': ERROR,
  // enforces escape of replacement `$` character (`$$`)
  'regexp/prefer-escape-replacement-dollar-char': ERROR,
  // prefer lookarounds over capturing group that do not replace
  'regexp/prefer-lookaround': [ERROR, { lookbehind: true, strictTypes: true }],
  // enforce using named backreferences
  'regexp/prefer-named-backreference': ERROR,
  // enforce using named capture group in regular expression
  'regexp/prefer-named-capture-group': ERROR,
  // enforce using named replacement
  'regexp/prefer-named-replacement': ERROR,
  // enforce using `+` quantifier
  'regexp/prefer-plus-quantifier': ERROR,
  // prefer predefined assertion over equivalent lookarounds
  'regexp/prefer-predefined-assertion': ERROR,
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
  // aims to optimize patterns by simplifying set operations in character classes (with v flag)
  'regexp/simplify-set-operations': ERROR,
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
  // ReDoS vulnerability check
  'redos/no-vulnerable': [ERROR, { timeout: 1e3, cache: { strategy: 'aggressive' } }],

  // disallow function declarations in if statement clauses without using blocks
  'es/no-function-declarations-in-if-statement-clauses-without-block': ERROR,
  // disallow initializers in for-in heads
  'es/no-initializers-in-for-in': ERROR,
  // disallow \u2028 and \u2029 in string literals
  'es/no-json-superset': ERROR,
  // disallow labelled function declarations
  'es/no-labelled-function-declarations': ERROR,
  // disallow the `RegExp.prototype.compile` method
  'es/no-regexp-prototype-compile': ERROR,

  // eslint-comments:
  // disallow duplicate `eslint-disable` comments
  'eslint-comments/no-duplicate-disable': ERROR,
  // disallow `eslint-disable` comments without rule names
  'eslint-comments/no-unlimited-disable': ERROR,
  // disallow unused `eslint-disable` comments
  //   it's clearly disabled since result of some rules (like `redos/no-vulnerable`) is non-deterministic
  //   and anyway it's reported because of `reportUnusedDisableDirectives` option
  'eslint-comments/no-unused-disable': OFF,
  // disallow unused `eslint-enable` comments
  'eslint-comments/no-unused-enable': ERROR,
  // require include descriptions in eslint directive-comments
  'eslint-comments/require-description': ERROR,
};

const noAsyncAwait = {
  // prefer `async` / `await` to the callback pattern
  'promise/prefer-await-to-callbacks': OFF,
  // prefer `await` to `then()` / `catch()` / `finally()` for reading `Promise` values
  'promise/prefer-await-to-then': OFF,
};

const useES3Syntax = {
  ...noAsyncAwait,
  // encourages use of dot notation whenever possible
  'dot-notation': [ERROR, { allowKeywords: false }],
  // disallow logical assignment operator shorthand
  'logical-assignment-operators': [ERROR, NEVER],
  // disallow function or variable declarations in nested blocks
  'no-inner-declarations': ERROR,
  // disallow specified syntax
  'no-restricted-syntax': OFF,
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
  // require rest parameters instead of `arguments`
  'prefer-rest-params': OFF,
  // require spread operators instead of `.apply()`
  'prefer-spread': OFF,
  // require template literals instead of string concatenation
  'prefer-template': OFF,
  // disallow trailing commas in multiline object literals
  '@stylistic/js/comma-dangle': [ERROR, NEVER],
  // require or disallow use of quotes around object literal property names
  '@stylistic/js/quote-props': [ERROR, 'as-needed', { keywords: true }],
  // prefer lookarounds over capturing group that do not replace
  'regexp/prefer-lookaround': [ERROR, { lookbehind: false, strictTypes: true }],
  // enforce using named capture group in regular expression
  'regexp/prefer-named-capture-group': OFF,
  // prefer default parameters over reassignment
  'unicorn/prefer-default-parameters': OFF,
  // prefer using a logical operator over a ternary
  'unicorn/prefer-logical-operator-over-ternary': OFF,
  // prefer omitting the `catch` binding parameter
  'unicorn/prefer-optional-catch-binding': OFF,
};

const forbidESAnnexBBuiltIns = {
  'es/no-date-prototype-getyear-setyear': ERROR,
  'es/no-date-prototype-togmtstring': ERROR,
  'es/no-escape-unescape': ERROR,
  'es/no-legacy-object-prototype-accessor-methods': ERROR,
  'es/no-string-create-html-methods': ERROR,
  'es/no-string-prototype-trimleft-trimright': ERROR,
  // prefer `String#slice` over `String#{ substr, substring }`
  'unicorn/prefer-string-slice': ERROR,
};

const forbidES5BuiltIns = {
  'es/no-array-isarray': ERROR,
  'es/no-array-prototype-every': ERROR,
  'es/no-array-prototype-filter': ERROR,
  'es/no-array-prototype-foreach': ERROR,
  'es/no-array-prototype-indexof': ERROR,
  'es/no-array-prototype-lastindexof': ERROR,
  'es/no-array-prototype-map': ERROR,
  'es/no-array-prototype-reduce': ERROR,
  'es/no-array-prototype-reduceright': ERROR,
  'es/no-array-prototype-some': ERROR,
  'es/no-date-now': ERROR,
  'es/no-function-prototype-bind': ERROR,
  'es/no-json': ERROR,
  'es/no-object-create': ERROR,
  'es/no-object-defineproperties': ERROR,
  'es/no-object-defineproperty': ERROR,
  'es/no-object-freeze': ERROR,
  'es/no-object-getownpropertydescriptor': ERROR,
  'es/no-object-getownpropertynames': ERROR,
  'es/no-object-getprototypeof': ERROR,
  'es/no-object-isextensible': ERROR,
  'es/no-object-isfrozen': ERROR,
  'es/no-object-issealed': ERROR,
  'es/no-object-keys': ERROR,
  'es/no-object-preventextensions': ERROR,
  'es/no-object-seal': ERROR,
  'es/no-string-prototype-trim': ERROR,
  // prefer `Date.now()` to get the number of milliseconds since the Unix Epoch
  'unicorn/prefer-date-now': OFF,
};

const forbidES2015BuiltIns = {
  'es/no-array-from': ERROR,
  'es/no-array-of': ERROR,
  'es/no-array-prototype-copywithin': ERROR,
  'es/no-array-prototype-entries': ERROR,
  'es/no-array-prototype-fill': ERROR,
  'es/no-array-prototype-find': ERROR,
  'es/no-array-prototype-findindex': ERROR,
  'es/no-array-prototype-keys': ERROR,
  'es/no-array-prototype-values': ERROR,
  'es/no-map': ERROR,
  'es/no-math-acosh': ERROR,
  'es/no-math-asinh': ERROR,
  'es/no-math-atanh': ERROR,
  'es/no-math-cbrt': ERROR,
  'es/no-math-clz32': ERROR,
  'es/no-math-cosh': ERROR,
  'es/no-math-expm1': ERROR,
  'es/no-math-fround': ERROR,
  'es/no-math-hypot': ERROR,
  'es/no-math-imul': ERROR,
  'es/no-math-log10': ERROR,
  'es/no-math-log1p': ERROR,
  'es/no-math-log2': ERROR,
  'es/no-math-sign': ERROR,
  'es/no-math-sinh': ERROR,
  'es/no-math-tanh': ERROR,
  'es/no-math-trunc': ERROR,
  'es/no-number-epsilon': ERROR,
  'es/no-number-isfinite': ERROR,
  'es/no-number-isinteger': ERROR,
  'es/no-number-isnan': ERROR,
  'es/no-number-issafeinteger': ERROR,
  'es/no-number-maxsafeinteger': ERROR,
  'es/no-number-minsafeinteger': ERROR,
  'es/no-number-parsefloat': ERROR,
  'es/no-number-parseint': ERROR,
  'es/no-object-assign': ERROR,
  'es/no-object-getownpropertysymbols': ERROR,
  'es/no-object-is': ERROR,
  'es/no-object-setprototypeof': ERROR,
  'es/no-promise': ERROR,
  'es/no-proxy': ERROR,
  'es/no-reflect': ERROR,
  'es/no-regexp-prototype-flags': ERROR,
  'es/no-set': ERROR,
  'es/no-string-fromcodepoint': ERROR,
  'es/no-string-prototype-codepointat': ERROR,
  'es/no-string-prototype-endswith': ERROR,
  'es/no-string-prototype-includes': ERROR,
  'es/no-string-prototype-normalize': ERROR,
  'es/no-string-prototype-repeat': ERROR,
  'es/no-string-prototype-startswith': ERROR,
  'es/no-string-raw': ERROR,
  'es/no-symbol': ERROR,
  'es/no-typed-arrays': ERROR,
  'es/no-weak-map': ERROR,
  'es/no-weak-set': ERROR,
  // prefer modern `Math` APIs over legacy patterns
  'unicorn/prefer-modern-math-apis': OFF,
  // prefer `String#{ startsWith, endsWith }()` over `RegExp#test()`
  'unicorn/prefer-string-starts-ends-with': OFF,
};

const forbidES2016BuiltIns = {
  'es/no-array-prototype-includes': ERROR,
  // prefer `.includes()` over `.indexOf()` and `Array#some()` when checking for existence or non-existence
  'unicorn/prefer-includes': OFF,
};

const forbidES2017BuiltIns = {
  'es/no-atomics': ERROR,
  'es/no-object-entries': ERROR,
  'es/no-object-getownpropertydescriptors': ERROR,
  'es/no-object-values': ERROR,
  'es/no-shared-array-buffer': ERROR,
  'es/no-string-prototype-padstart-padend': ERROR,
};

const forbidES2018BuiltIns = {
  'es/no-promise-prototype-finally': ERROR,
};

const forbidES2019BuiltIns = {
  'es/no-array-prototype-flat': ERROR,
  'es/no-object-fromentries': ERROR,
  'es/no-string-prototype-trimstart-trimend': ERROR,
  'es/no-symbol-prototype-description': ERROR,
  // use `.flat()` to flatten an array of arrays
  'unicorn/prefer-array-flat': OFF,
  // prefer using `Object.fromEntries()` to transform a list of key-value pairs into an object
  'unicorn/prefer-object-from-entries': OFF,
  // prefer `String#{ trimStart, trimEnd }()` over `String#{ trimLeft, trimRight }()`
  'unicorn/prefer-string-trim-start-end': OFF,
};

const forbidES2020BuiltIns = {
  'es/no-bigint': ERROR,
  'es/no-global-this': ERROR,
  'es/no-promise-all-settled': ERROR,
  'es/no-regexp-unicode-property-escapes-2020': ERROR,
  'es/no-string-prototype-matchall': ERROR,
};

const forbidES2021BuiltIns = {
  'es/no-promise-any': ERROR,
  'es/no-regexp-unicode-property-escapes-2021': ERROR,
  'es/no-string-prototype-replaceall': ERROR,
  'es/no-weakrefs': ERROR,
  // prefer `String#replaceAll()` over regex searches with the global flag
  'unicorn/prefer-string-replace-all': OFF,
};

const forbidES2022BuiltIns = {
  // prefer `Object.hasOwn`
  'prefer-object-has-own': OFF,
  'es/no-array-string-prototype-at': ERROR,
  'es/no-error-cause': ERROR,
  'es/no-object-hasown': ERROR,
  'es/no-regexp-d-flag': ERROR,
  'es/no-regexp-unicode-property-escapes-2022': ERROR,
  // prefer `.at()` method for index access and `String#charAt()`
  'unicorn/prefer-at': OFF,
};

const forbidES2023BuiltIns = {
  'es/no-array-prototype-findlast-findlastindex': ERROR,
  'es/no-array-prototype-toreversed': ERROR,
  'es/no-array-prototype-tosorted': ERROR,
  'es/no-array-prototype-tospliced': ERROR,
  'es/no-array-prototype-with': ERROR,
  'es/no-regexp-unicode-property-escapes-2023': ERROR,
};

const forbidES2024BuiltIns = {
  'es/no-atomics-waitasync': ERROR,
  'es/no-object-map-groupby': ERROR,
  'es/no-promise-withresolvers': ERROR,
  'es/no-string-prototype-iswellformed-towellformed': ERROR,
  'es/no-regexp-v-flag': ERROR,
  'es/no-resizable-and-growable-arraybuffers': ERROR,
};

const forbidES2016IntlBuiltIns = {
  'es/no-intl-getcanonicallocales': ERROR,
};

const forbidES2017IntlBuiltIns = {
  'es/no-intl-datetimeformat-prototype-formattoparts': ERROR,
};

const forbidES2018IntlBuiltIns = {
  'es/no-intl-numberformat-prototype-formattoparts': ERROR,
  'es/no-intl-pluralrules': ERROR,
};

const forbidES2020IntlBuiltIns = {
  'es/no-intl-locale': ERROR,
  'es/no-intl-relativetimeformat': ERROR,
};

const forbidES2021IntlBuiltIns = {
  'es/no-intl-datetimeformat-prototype-formatrange': ERROR,
  'es/no-intl-displaynames': ERROR,
  'es/no-intl-listformat': ERROR,
};

const forbidES2022IntlBuiltIns = {
  'es/no-intl-segmenter': ERROR,
  'es/no-intl-supportedvaluesof': ERROR,
};

const forbidES2023IntlBuiltIns = {
  'es/no-intl-numberformat-prototype-formatrange': ERROR,
  'es/no-intl-numberformat-prototype-formatrangetoparts': ERROR,
  'es/no-intl-pluralrules-prototype-selectrange': ERROR,
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
  ...forbidES2023BuiltIns,
  ...forbidES2024BuiltIns,
  ...forbidES2016IntlBuiltIns,
  ...forbidES2017IntlBuiltIns,
  ...forbidES2018IntlBuiltIns,
  ...forbidES2020IntlBuiltIns,
  ...forbidES2021IntlBuiltIns,
  ...forbidES2022IntlBuiltIns,
  ...forbidES2023IntlBuiltIns,
};

const polyfills = {
  // prefer `node:` protocol
  'node/prefer-node-protocol': OFF,
  // avoid nested `then()` or `catch()` statements
  'promise/no-nesting': OFF,
  // prefer `RegExp#test()` over `String#match()` and `RegExp#exec()`
  // use `RegExp#exec()` since it does not have implicit calls under the hood
  'regexp/prefer-regexp-test': OFF,
};

const transpiledAndPolyfilled = {
  ...noAsyncAwait,
  // disallow accessor properties
  'es/no-accessor-properties': ERROR,
  // disallow async functions
  'es/no-async-functions': ERROR,
  // disallow async iteration
  'es/no-async-iteration': ERROR,
  // disallow generators
  'es/no-generators': ERROR,
  // disallow top-level `await`
  'es/no-top-level-await': ERROR,
  // unpolyfillable es2015 builtins
  'es/no-proxy': ERROR,
  'es/no-string-prototype-normalize': ERROR,
  // unpolyfillable es2017 builtins
  'es/no-atomics': ERROR,
  'es/no-shared-array-buffer': ERROR,
  // unpolyfillable es2020 builtins
  'es/no-bigint': ERROR,
  // unpolyfillable es2021 builtins
  'es/no-weakrefs': ERROR,
  // prefer lookarounds over capturing group that do not replace
  'regexp/prefer-lookaround': [ERROR, { lookbehind: false, strictTypes: true }],
  // enforce using named capture group in regular expression
  'regexp/prefer-named-capture-group': OFF,
};

const nodePackages = {
  // disallow logical assignment operator shorthand
  'logical-assignment-operators': [ERROR, NEVER],
  // enforces the use of `catch()` on un-returned promises
  'promise/catch-or-return': ERROR,
  // disallow third-party modules which are hiding core modules
  'node/no-hide-core-modules': OFF,
  // disallow unsupported ECMAScript built-ins on the specified version
  'node/no-unsupported-features/node-builtins': [ERROR, { version: PACKAGES_NODE_VERSIONS }],
  // prefer `node:` protocol
  'node/prefer-node-protocol': OFF,
  // prefer promises
  'node/prefer-promises/dns': OFF,
  'node/prefer-promises/fs': OFF,
  // prefer lookarounds over capturing group that do not replace
  'regexp/prefer-lookaround': [ERROR, { lookbehind: false, strictTypes: true }],
  // enforce using named capture group in regular expression
  'regexp/prefer-named-capture-group': OFF,
  // prefer using a logical operator over a ternary
  'unicorn/prefer-logical-operator-over-ternary': OFF,
  // prefer using the `node:` protocol when importing Node builtin modules
  'unicorn/prefer-node-protocol': OFF,
  // prefer omitting the `catch` binding parameter
  'unicorn/prefer-optional-catch-binding': OFF,
  ...disable(forbidES5BuiltIns),
  ...disable(forbidES2015BuiltIns),
  ...disable(forbidES2016BuiltIns),
  ...disable(forbidES2017BuiltIns),
  'es/no-atomics': ERROR,
  'es/no-shared-array-buffer': ERROR,
  // disallow top-level `await`
  'es/no-top-level-await': ERROR,
  ...forbidES2018BuiltIns,
  ...forbidES2019BuiltIns,
  ...forbidES2020BuiltIns,
  ...forbidES2021BuiltIns,
  ...forbidES2022BuiltIns,
  ...forbidES2023BuiltIns,
  ...forbidES2024BuiltIns,
  ...disable(forbidES2016IntlBuiltIns),
  ...disable(forbidES2017IntlBuiltIns),
  ...forbidES2018IntlBuiltIns,
  ...forbidES2020IntlBuiltIns,
  ...forbidES2021IntlBuiltIns,
  ...forbidES2022IntlBuiltIns,
  ...forbidES2023IntlBuiltIns,
};

const nodeDev = {
  // disallow unsupported ECMAScript built-ins on the specified version
  'node/no-unsupported-features/node-builtins': [ERROR, { version: DEV_NODE_VERSIONS }],
  ...disable(forbidModernESBuiltIns),
  ...forbidES2023BuiltIns,
  'es/no-array-prototype-findlast-findlastindex': OFF,
  ...forbidES2024BuiltIns,
  'es/no-intl-supportedvaluesof': ERROR,
  ...forbidES2023IntlBuiltIns,
  // ReDoS vulnerability check
  'redos/no-vulnerable': OFF,
  // prefer top-level await
  'unicorn/prefer-top-level-await': ERROR,
};

const tests = {
  // relax for testing:
  // enforces return statements in callbacks of array's methods
  'array-callback-return': OFF,
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
  // disallow specified syntax
  'no-restricted-syntax': OFF,
  // restrict what can be thrown as an exception
  'no-throw-literal': OFF,
  // disallow usage of expressions in statement position
  'no-unused-expressions': OFF,
  // disallow dangling underscores in identifiers
  'no-underscore-dangle': [ERROR, { allow: [
    '__defineGetter__',
    '__defineSetter__',
    '__lookupGetter__',
    '__lookupSetter__',
  ] }],
  // disallow unnecessary calls to `.call()` and `.apply()`
  'no-useless-call': OFF,
  // specify the maximum length of a line in your program
  '@stylistic/js/max-len': [ERROR, { ...base['@stylistic/js/max-len'][1], code: 180 }],
  // enforce passing a message value when throwing a built-in error
  'unicorn/error-message': OFF,
  // prefer `.at()` method for index access and `String#charAt()`
  'unicorn/prefer-at': OFF,
  // prefer `.includes()` over `.indexOf()` and `Array#some()` when checking for existence or non-existence
  'unicorn/prefer-includes': OFF,
  // ReDoS vulnerability check
  'redos/no-vulnerable': OFF,
  // allow Annex B methods for testing
  ...disable(forbidESAnnexBBuiltIns),
};

const qunit = {
  // ensure the correct number of assert arguments is used
  'qunit/assert-args': ERROR,
  // enforce comparison assertions have arguments in the right order
  'qunit/literal-compare-order': ERROR,
  // forbid the use of `assert.equal`
  'qunit/no-assert-equal': ERROR,
  // require use of boolean assertions
  'qunit/no-assert-equal-boolean': ERROR,
  // disallow binary logical expressions in assert arguments
  'qunit/no-assert-logical-expression': ERROR,
  // forbid async calls in loops
  'qunit/no-async-in-loops': ERROR,
  // disallow async module callbacks
  'qunit/no-async-module-callbacks': ERROR,
  // forbid the use of `asyncTest`
  'qunit/no-async-test': ERROR,
  // forbid commented tests
  'qunit/no-commented-tests': ERROR,
  // forbid comparing relational expression to boolean in assertions
  'qunit/no-compare-relation-boolean': ERROR,
  // prevent early return in a qunit test
  'qunit/no-early-return': ERROR,
  // forbid the use of global qunit assertions
  'qunit/no-global-assertions': ERROR,
  // forbid the use of global `expect`
  'qunit/no-global-expect': ERROR,
  // forbid the use of global `module` / `test` / `asyncTest`
  'qunit/no-global-module-test': ERROR,
  // forbid use of global `stop` / `start`
  'qunit/no-global-stop-start': ERROR,
  // disallow the use of hooks from ancestor modules
  'qunit/no-hooks-from-ancestor-modules': ERROR,
  // forbid identical test and module names
  'qunit/no-identical-names': ERROR,
  // forbid use of `QUnit.init`
  'qunit/no-init': ERROR,
  // forbid use of `QUnit.jsDump`
  'qunit/no-jsdump': ERROR,
  // disallow the use of `assert.equal` / `assert.ok` / `assert.notEqual` / `assert.notOk``
  'qunit/no-loose-assertions': ERROR,
  // forbid `QUnit.test()` calls inside callback of another `QUnit.test`
  'qunit/no-nested-tests': ERROR,
  // forbid equality comparisons in `assert.{ ok, notOk }`
  'qunit/no-ok-equality': ERROR,
  // disallow `QUnit.only`
  'qunit/no-only': ERROR,
  // forbid the use of `QUnit.push`
  'qunit/no-qunit-push': ERROR,
  // forbid `QUnit.start` within tests or test hooks
  'qunit/no-qunit-start-in-tests': ERROR,
  // forbid the use of `QUnit.stop`
  'qunit/no-qunit-stop': ERROR,
  // forbid overwriting of QUnit logging callbacks
  'qunit/no-reassign-log-callbacks': ERROR,
  // forbid use of `QUnit.reset`
  'qunit/no-reset': ERROR,
  // forbid setup / teardown module hooks
  'qunit/no-setup-teardown': ERROR,
  // forbid expect argument in `QUnit.test`
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
  // disallow binary expression
  'jsonc/no-binary-expression': ERROR,
  // disallow binary numeric literals
  'jsonc/no-binary-numeric-literals': ERROR,
  // disallow comments
  'jsonc/no-comments': ERROR,
  // disallow duplicate keys when creating object literals
  'jsonc/no-dupe-keys': ERROR,
  // disallow escape sequences in identifiers.
  'jsonc/no-escape-sequence-in-identifier': ERROR,
  // disallow leading or trailing decimal points in numeric literals
  'jsonc/no-floating-decimal': ERROR,
  // disallow hexadecimal numeric literals
  'jsonc/no-hexadecimal-numeric-literals': ERROR,
  // disallow `Infinity`
  'jsonc/no-infinity': ERROR,
  // disallow irregular whitespace
  'jsonc/no-irregular-whitespace': ERROR,
  // disallow use of multiline strings
  'jsonc/no-multi-str': ERROR,
  // disallow `NaN`
  'jsonc/no-nan': ERROR,
  // disallow number property keys
  'jsonc/no-number-props': ERROR,
  // disallow numeric separators
  'jsonc/no-numeric-separators': ERROR,
  // disallow use of octal escape sequences in string literals, such as var foo = 'Copyright \251';
  'jsonc/no-octal-escape': ERROR,
  // disallow octal numeric literals
  'jsonc/no-octal-numeric-literals': ERROR,
  // disallow legacy octal literals
  'jsonc/no-octal': ERROR,
  // disallow parentheses around the expression
  'jsonc/no-parenthesized': ERROR,
  // disallow plus sign
  'jsonc/no-plus-sign': ERROR,
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
  '@stylistic/js/max-len': OFF,
  // require strict mode directives
  strict: OFF,
};

const globalsESNext = {
  AsyncDisposableStack: READONLY,
  AsyncIterator: READONLY,
  DisposableStack: READONLY,
  Iterator: READONLY,
  Observable: READONLY,
  SuppressedError: READONLY,
  compositeKey: READONLY,
  compositeSymbol: READONLY,
};

const globalsZX = {
  $: READONLY,
  __dirname: READONLY,
  __filename: READONLY,
  argv: READONLY,
  cd: READONLY,
  chalk: READONLY,
  echo: READONLY,
  fetch: READONLY,
  fs: READONLY,
  glob: READONLY,
  nothrow: READONLY,
  os: READONLY,
  path: READONLY,
  question: READONLY,
  require: READONLY,
  sleep: READONLY,
  stdin: READONLY,
  which: READONLY,
  within: READONLY,
  YAML: READONLY,
};

export default [
  {
    ignores: [
      'deno/corejs/**',
      'docs/**',
      'packages/core-js-bundle/!(package.json)',
      'packages/core-js-compat/!(package).json',
      'packages/core-js-pure/override/**',
      'tests/**/bundles/**',
      'tests/compat/compat-data.js',
      'tests/unit-@(global|pure)/index.js',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      // unnecessary global builtins disabled by related rules
      globals: {
        ...globals.builtin,
        ...globals.browser,
        ...globals.node,
        ...globals.worker,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      '@stylistic/js': pluginStylisticJS,
      'array-func': pluginArrayFunc,
      es: pluginESX,
      'eslint-comments': pluginESlintComments,
      filenames: pluginFilenames,
      import: pluginImport,
      jsonc: pluginJSONC,
      node: pluginN,
      promise: pluginPromise,
      qunit: pluginQUnit,
      redos: pluginReDoS,
      regexp: pluginRegExp,
      sonarjs: pluginSonarJS,
      unicorn: pluginUnicorn,
    },
    rules: {
      ...base,
      ...forbidESAnnexBBuiltIns,
    },
  },
  {
    files: [
      '**/*.mjs',
      'tests/eslint/**',
    ],
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    files: [
      'packages/core-js?(-pure)/**',
      'tests/@(compat|worker)/*.js',
    ],
    languageOptions: {
      ecmaVersion: 3,
    },
    rules: useES3Syntax,
  },
  {
    files: [
      'packages/core-js?(-pure)/**',
      'tests/@(unit-pure|worker)/**',
      'tests/compat/@(browsers|hermes|node|rhino)-runner.js',
    ],
    rules: forbidModernESBuiltIns,
  },
  {
    files: [
      'packages/core-js?(-pure)/**',
    ],
    rules: polyfills,
  },
  {
    files: [
      '**/postinstall.js',
    ],
    rules: disable(forbidES5BuiltIns),
  },
  {
    files: [
      'tests/@(helpers|unit-@(global|pure)|wpt-url-resources)/**',
    ],
    languageOptions: {
      sourceType: 'module',
    },
    rules: transpiledAndPolyfilled,
  },
  {
    files: [
      'tests/**',
    ],
    rules: tests,
  },
  {
    files: [
      'tests/@(helpers|unit-@(global|pure))/**',
    ],
    languageOptions: {
      globals: globals.qunit,
    },
    rules: qunit,
  },
  {
    files: [
      'packages/core-js-@(builder|compat)/**',
    ],
    rules: nodePackages,
  },
  {
    files: [
      '*.js',
      'packages/core-js-compat/src/**',
      'scripts/**',
      'tests/compat/*.mjs',
      'tests/@(compat-@(data|tools)|eslint|entries|observables|promises-aplus|unit-@(karma|node))/**',
    ],
    rules: nodeDev,
  },
  {
    files: [
      'tests/@(compat|unit-global)/**',
    ],
    languageOptions: {
      globals: globalsESNext,
    },
  },
  {
    files: [
      '@(scripts|tests)/*/**',
    ],
    rules: {
      // disable this rule for lazily installed dependencies
      'import/no-unresolved': [ERROR, { commonjs: true, ignore: ['^[^.]'] }],
    },
  },
  {
    files: [
      'packages/core-js-compat/src/**',
      'scripts/**',
      'tests/**/*.mjs',
    ],
    languageOptions: {
      // zx
      globals: globalsZX,
    },
    rules: {
      // allow use of console
      'no-console': OFF,
      // import used for tasks
      'import/first': OFF,
    },
  },
  {
    rules: {
      // ensure that filenames match a convention
      'filenames/match-regex': [ERROR, /^[\da-z]|[a-z][\d\-.a-z]*[\da-z]$/],
    },
  },
  {
    files: [
      'packages/core-js?(-pure)/modules/**',
    ],
    rules: {
      // ensure that filenames match a convention
      'filenames/match-regex': [ERROR, /^(?:es|esnext|web)(?:\.[a-z][\d\-a-z]*[\da-z])+$/],
    },
  },
  {
    files: [
      'tests/@(unit-@(global|pure))/**',
    ],
    rules: {
      // ensure that filenames match a convention
      'filenames/match-regex': [ERROR, /^(?:es|esnext|helpers|web)(?:\.[a-z][\d\-a-z]*[\da-z])+$/],
    },
  },
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: parserJSONC,
    },
    rules: json,
  },
];
