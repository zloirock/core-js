import globals from 'globals';
import confusingBrowserGlobals from 'confusing-browser-globals';
import parserJSONC from 'jsonc-eslint-parser';
import pluginArrayFunc from 'eslint-plugin-array-func';
import pluginASCII from 'eslint-plugin-ascii';
import pluginCanonical from 'eslint-plugin-canonical';
import pluginDepend from 'eslint-plugin-depend';
import pluginESX from 'eslint-plugin-es-x';
import pluginESlintComments from '@eslint-community/eslint-plugin-eslint-comments';
import pluginImport from 'eslint-plugin-import-x';
import pluginJSONC from 'eslint-plugin-jsonc';
import pluginMarkdown from '@eslint/markdown';
import pluginMath from 'eslint-plugin-math';
import pluginN from 'eslint-plugin-n';
import pluginNodeDependencies from 'eslint-plugin-node-dependencies';
import * as pluginPackageJSON from 'eslint-plugin-package-json';
import pluginPromise from 'eslint-plugin-promise';
import pluginQUnit from 'eslint-plugin-qunit';
import pluginReDoS from 'eslint-plugin-redos';
import pluginRegExp from 'eslint-plugin-regexp';
import pluginSonarJS from 'eslint-plugin-sonarjs';
import pluginStylistic from '@stylistic/eslint-plugin';
import pluginUnicorn from 'eslint-plugin-unicorn';
import { yaml as pluginYaml } from 'eslint-yaml';

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
  // disallow `let` or `var` variables that are read but never assigned
  'no-unassigned-vars': ERROR,
  // disallow use of undeclared variables unless mentioned in a /*global */ block
  'no-undef': [ERROR, { typeof: false }],
  // avoid code that looks like two expressions but is actually one
  'no-unexpected-multiline': ERROR,
  // disallow unmodified loop conditions
  'no-unmodified-loop-condition': ERROR,
  // disallow unreachable statements after a return, throw, continue, or break statement
  'no-unreachable': ERROR,
  // disallow loops with a body that allows only one iteration
  'no-unreachable-loop': ERROR,
  // disallow control flow statements in `finally` blocks
  'no-unsafe-finally': ERROR,
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
    caughtErrors: 'none',
    ignoreRestSiblings: true,
  }],
  // disallow variable assignments when the value is not used
  'no-useless-assignment': ERROR,
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
  camelcase: [ERROR, {
    properties: NEVER,
    ignoreDestructuring: true,
    ignoreImports: true,
    ignoreGlobals: true,
  }],
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
  // require identifiers to match a specified regular expression
  'id-match': [ERROR, '^[$A-Za-z]|(?:[A-Z][A-Z\\d_]*[A-Z\\d])|(?:[$A-Za-z]\\w*[A-Za-z\\d])$', {
    onlyDeclarations: true,
    ignoreDestructuring: true,
  }],
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
  'no-else-return': [ERROR, { allowElseIf: false }],
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
  'no-extra-boolean-cast': [ERROR, { enforceForInnerExpressions: true }],
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
    ignoreDirectives: true,
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
  'prefer-destructuring': [ERROR, {
    VariableDeclarator: {
      array: true,
      object: true,
    },
    AssignmentExpression: {
      array: true,
      object: false,
    },
  }, {
    enforceForRenamedProperties: false,
  }],
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
  '@stylistic/array-bracket-spacing': [ERROR, NEVER],
  // require parentheses around arrow function arguments
  '@stylistic/arrow-parens': [ERROR, 'as-needed'],
  // enforce consistent spacing before and after the arrow in arrow functions
  '@stylistic/arrow-spacing': ERROR,
  // enforce spacing inside single-line blocks
  '@stylistic/block-spacing': [ERROR, ALWAYS],
  // enforce one true brace style
  '@stylistic/brace-style': [ERROR, '1tbs', { allowSingleLine: true }],
  // enforce trailing commas in multiline object literals
  '@stylistic/comma-dangle': [ERROR, 'always-multiline'],
  // enforce spacing after comma
  '@stylistic/comma-spacing': ERROR,
  // enforce one true comma style
  '@stylistic/comma-style': [ERROR, 'last'],
  // disallow padding inside computed properties
  '@stylistic/computed-property-spacing': [ERROR, NEVER],
  // enforce consistent line breaks after opening and before closing braces
  '@stylistic/curly-newline': [ERROR, { consistent: true }],
  // enforce newline before and after dot
  '@stylistic/dot-location': [ERROR, 'property'],
  // enforce one newline at the end of files
  '@stylistic/eol-last': [ERROR, ALWAYS],
  // disallow space between function identifier and application
  '@stylistic/function-call-spacing': ERROR,
  // require spacing around the `*` in `function *` expressions
  '@stylistic/generator-star-spacing': [ERROR, 'both'],
  // enforce the location of arrow function bodies
  '@stylistic/implicit-arrow-linebreak': [ERROR, 'beside'],
  // enforce consistent indentation
  '@stylistic/indent': [ERROR, 2, {
    ignoredNodes: ['ConditionalExpression'],
    SwitchCase: 1,
    VariableDeclarator: 'first',
  }],
  // enforces spacing between keys and values in object literal properties
  '@stylistic/key-spacing': [ERROR, { beforeColon: false, afterColon: true }],
  // require a space before & after certain keywords
  '@stylistic/keyword-spacing': [ERROR, { before: true, after: true }],
  // enforce consistent linebreak style
  '@stylistic/linebreak-style': [ERROR, 'unix'],
  // specify the maximum length of a line in your program
  '@stylistic/max-len': [ERROR, {
    code: 140,
    tabWidth: 2,
    ignoreRegExpLiterals: true,
    ignoreTemplateLiterals: true,
    ignoreUrls: true,
    ignorePattern: '<svg[\\s\\S]*?</svg>',
  }],
  // enforce a maximum number of statements allowed per line
  '@stylistic/max-statements-per-line': [ERROR, { max: 2 }],
  // require parentheses when invoking a constructor with no arguments
  '@stylistic/new-parens': ERROR,
  // disallow unnecessary semicolons
  '@stylistic/no-extra-semi': ERROR,
  // disallow the use of leading or trailing decimal points in numeric literals
  '@stylistic/no-floating-decimal': ERROR,
  // disallow mixed spaces and tabs for indentation
  '@stylistic/no-mixed-spaces-and-tabs': ERROR,
  // disallow use of multiple spaces
  '@stylistic/no-multi-spaces': [ERROR, { ignoreEOLComments: true }],
  // disallow multiple empty lines and only one newline at the end
  '@stylistic/no-multiple-empty-lines': [ERROR, { max: 1, maxEOF: 1 }],
  // disallow tabs
  '@stylistic/no-tabs': ERROR,
  // disallow trailing whitespace at the end of lines
  '@stylistic/no-trailing-spaces': ERROR,
  // disallow whitespace before properties
  '@stylistic/no-whitespace-before-property': ERROR,
  // enforce the location of single-line statements
  '@stylistic/nonblock-statement-body-position': [ERROR, 'beside'],
  // enforce consistent line breaks after opening and before closing braces
  '@stylistic/object-curly-newline': [ERROR, { consistent: true }],
  // enforce spaces inside braces
  '@stylistic/object-curly-spacing': [ERROR, ALWAYS],
  // require newlines around variable declarations with initializations
  '@stylistic/one-var-declaration-per-line': [ERROR, 'initializations'],
  // enforce padding within blocks
  '@stylistic/padded-blocks': [ERROR, NEVER],
  // disallow blank lines after 'use strict'
  '@stylistic/padding-line-between-statements': [ERROR, { blankLine: NEVER, prev: 'directive', next: '*' }],
  // require or disallow use of quotes around object literal property names
  '@stylistic/quote-props': [ERROR, 'as-needed', { keywords: false }],
  // specify whether double or single quotes should be used
  '@stylistic/quotes': [ERROR, 'single', { avoidEscape: true }],
  // enforce spacing between rest and spread operators and their expressions
  '@stylistic/rest-spread-spacing': ERROR,
  // require or disallow use of semicolons instead of ASI
  '@stylistic/semi': [ERROR, ALWAYS],
  // enforce spacing before and after semicolons
  '@stylistic/semi-spacing': ERROR,
  // enforce location of semicolons
  '@stylistic/semi-style': [ERROR, 'last'],
  // require or disallow space before blocks
  '@stylistic/space-before-blocks': ERROR,
  // require or disallow space before function opening parenthesis
  '@stylistic/space-before-function-paren': [ERROR, { anonymous: ALWAYS, named: NEVER }],
  // require or disallow spaces inside parentheses
  '@stylistic/space-in-parens': ERROR,
  // require spaces around operators
  '@stylistic/space-infix-ops': ERROR,
  // require or disallow spaces before/after unary operators
  '@stylistic/space-unary-ops': ERROR,
  // require or disallow a space immediately following the // or /* in a comment
  '@stylistic/spaced-comment': [ERROR, ALWAYS, {
    line: { exceptions: ['/'] },
    block: { exceptions: ['*'] },
  }],
  // enforce spacing around colons of switch statements
  '@stylistic/switch-colon-spacing': ERROR,
  // require or disallow spacing around embedded expressions of template strings
  '@stylistic/template-curly-spacing': [ERROR, ALWAYS],
  // disallow spacing between template tags and their literals
  '@stylistic/template-tag-spacing': [ERROR, NEVER],
  // require spacing around the `*` in `yield *` expressions
  '@stylistic/yield-star-spacing': [ERROR, 'both'],

  // ascii
  // forbid non-ascii chars in ast node names
  'ascii/valid-name': ERROR,

  // import:
  // forbid any invalid exports, i.e. re-export of the same name
  'import/export': ERROR,
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
  // forbid Webpack loader syntax in imports
  'import/no-webpack-loader-syntax': ERROR,

  // node:
  // enforce the style of file extensions in `import` declarations
  'node/file-extension-in-import': ERROR,
  // require require() calls to be placed at top-level module scope
  'node/global-require': ERROR,
  // disallow deprecated APIs
  'node/no-deprecated-api': ERROR,
  // disallow the assignment to `exports`
  'node/no-exports-assign': ERROR,
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
  // enforces the use of `catch()` on un-returned promises
  'promise/catch-or-return': ERROR,
  // avoid calling `cb()` inside of a `then()` or `catch()`
  'promise/no-callback-in-promise': ERROR,
  // disallow creating new promises with paths that resolve multiple times
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
  'promise/prefer-await-to-then': [ERROR, { strict: true }],
  // prefer catch to `then(a, b)` / `then(null, b)` for handling errors
  'promise/prefer-catch': ERROR,
  // disallow use of non-standard `Promise` static methods
  'promise/spec-only': [OFF, { allowedMethods: [
    'prototype', // `eslint-plugin-promise` bug, https://github.com/eslint-community/eslint-plugin-promise/issues/533
    'try',
    'undefined', // `eslint-plugin-promise` bug, https://github.com/eslint-community/eslint-plugin-promise/issues/534
  ] }],
  // ensures the proper number of arguments are passed to `Promise` functions
  'promise/valid-params': ERROR,

  // unicorn
  // enforce a specific parameter name in `catch` clauses
  'unicorn/catch-error-name': [ERROR, { name: ERROR, ignore: [/^err/] }],
  // enforce consistent assertion style with `node:assert`
  'unicorn/consistent-assert': ERROR,
  // prefer passing `Date` directly to the constructor when cloning
  'unicorn/consistent-date-clone': ERROR,
  // prefer consistent types when spreading a ternary in an array literal
  'unicorn/consistent-empty-array-spread': ERROR,
  // enforce consistent style for element existence checks with `indexOf()`, `lastIndexOf()`, `findIndex()`, and `findLastIndex()`
  'unicorn/consistent-existence-index-check': ERROR,
  // enforce correct `Error` subclassing
  'unicorn/custom-error-definition': ERROR,
  // enforce passing a message value when throwing a built-in error
  'unicorn/error-message': ERROR,
  // require escape sequences to use uppercase values
  'unicorn/escape-case': [ERROR, 'uppercase'],
  // enforce a case style for filenames
  'unicorn/filename-case': [ERROR, { case: 'kebabCase' }],
  // enforce specifying rules to disable in `eslint-disable` comments
  'unicorn/no-abusive-eslint-disable': ERROR,
  // disallow recursive access to `this` within getters and setters
  'unicorn/no-accessor-recursion': ERROR,
  // prefer `Array#toReversed()` over `Array#reverse()`
  'unicorn/no-array-reverse': ERROR,
  // disallow using `await` in `Promise` method parameters
  'unicorn/no-await-in-promise-methods': ERROR,
  // do not use leading/trailing space between `console.log` parameters
  'unicorn/no-console-spaces': ERROR,
  // enforce the use of unicode escapes instead of hexadecimal escapes
  'unicorn/no-hex-escape': ERROR,
  // disallow immediate mutation after variable assignment
  // that cause problems with objects in ES3 syntax, but since unicorn team
  // don't wanna add an option to allow it, manually disable this rule in such problem cases
  // https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2796
  'unicorn/no-immediate-mutation': ERROR,
  // disallow `instanceof` with built-in objects
  'unicorn/no-instanceof-builtins': [ERROR, { strategy: 'loose' }],
  // disallow invalid options in `fetch` and `Request`
  'unicorn/no-invalid-fetch-options': ERROR,
  // prevent calling `EventTarget#removeEventListener()` with the result of an expression
  'unicorn/no-invalid-remove-event-listener': ERROR,
  // disallow `if` statements as the only statement in `if` blocks without `else`
  'unicorn/no-lonely-if': ERROR,
  // disallow named usage of default import and export
  'unicorn/no-named-default': ERROR,
  // disallow negated expression in equality check
  'unicorn/no-negation-in-equality-check': ERROR,
  // enforce the use of `Buffer.from()` and `Buffer.alloc()` instead of the deprecated `new Buffer()`
  'unicorn/no-new-buffer': ERROR,
  // disallow passing single-element arrays to `Promise` methods
  'unicorn/no-single-promise-in-promise-methods': ERROR,
  // forbid classes that only have static members
  'unicorn/no-static-only-class': ERROR,
  // disallow `then` property
  'unicorn/no-thenable': ERROR,
  // disallow comparing `undefined` using `typeof` when it's not required
  'unicorn/no-typeof-undefined': ERROR,
  // disallow using 1 as the depth argument of `Array#flat()`
  'unicorn/no-unnecessary-array-flat-depth': ERROR,
  // disallow using `.length` or `Infinity` as the `deleteCount` or `skipCount` argument of `Array#{ splice, toSpliced }()`
  'unicorn/no-unnecessary-array-splice-count': ERROR,
  // disallow awaiting non-promise values
  'unicorn/no-unnecessary-await': ERROR,
  // disallow using `.length` or `Infinity` as the end argument of `{ Array, String, %TypedArray% }#slice()`
  'unicorn/no-unnecessary-slice-end': ERROR,
  // disallow unreadable array destructuring
  'unicorn/no-unreadable-array-destructuring': ERROR,
  // disallow unreadable IIFEs
  'unicorn/no-unreadable-iife': ERROR,
  // disallow unused object properties
  'unicorn/no-unused-properties': ERROR,
  // disallow useless values or fallbacks in `Set`, `Map`, `WeakSet`, or `WeakMap`
  'unicorn/no-useless-collection-argument': ERROR,
  // disallow unnecessary `Error.captureStackTrace()`
  'unicorn/no-useless-error-capture-stack-trace': ERROR,
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
  'unicorn/number-literal-case': [ERROR, { hexadecimalValue: 'uppercase' }],
  // enforce the style of numeric separators by correctly grouping digits
  'unicorn/numeric-separators-style': [ERROR, {
    onlyIfContainsSeparator: true,
    number: { minimumDigits: 0, groupLength: 3 },
    binary: { minimumDigits: 0, groupLength: 4 },
    octal: { minimumDigits: 0, groupLength: 4 },
    hexadecimal: { minimumDigits: 0, groupLength: 2 },
  }],
  // prefer `.find()` over the first element from `.filter()`
  'unicorn/prefer-array-find': [ERROR, { checkFromLast: true }],
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
  // prefer `BigInt` literals over the constructor
  'unicorn/prefer-bigint-literals': ERROR,
  // prefer `Blob#{ arrayBuffer, text }` over `FileReader#{ readAsArrayBuffer, readAsText }`
  'unicorn/prefer-blob-reading-methods': ERROR,
  // prefer class field declarations over this assignments in constructors
  'unicorn/prefer-class-fields': ERROR,
  // prefer using `Element#classList.toggle()` to toggle class names
  'unicorn/prefer-classlist-toggle': ERROR,
  // prefer `Date.now()` to get the number of milliseconds since the Unix Epoch
  'unicorn/prefer-date-now': ERROR,
  // prefer default parameters over reassignment
  'unicorn/prefer-default-parameters': ERROR,
  // prefer `EventTarget` over `EventEmitter`
  'unicorn/prefer-event-target': ERROR,
  // prefer `globalThis` over `window`, `self`, and `global`
  'unicorn/prefer-global-this': ERROR,
  // prefer `.includes()` over `.indexOf()` and `Array#some()` when checking for existence or non-existence
  'unicorn/prefer-includes': ERROR,
  // prefer reading a `JSON` file as a buffer
  'unicorn/prefer-json-parse-buffer': ERROR,
  // prefer using a logical operator over a ternary
  'unicorn/prefer-logical-operator-over-ternary': ERROR,
  // prefer `Math.min()` and `Math.max()` over ternaries for simple comparisons
  'unicorn/prefer-math-min-max': ERROR,
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
  // prefer `Response.json()` over `new Response(JSON.stringify())`
  'unicorn/prefer-response-static-json': ERROR,
  // prefer using `structuredClone` to create a deep clone
  'unicorn/prefer-structured-clone': ERROR,
  // prefer using `Set#size` instead of `Array#length`
  'unicorn/prefer-set-size': ERROR,
  // enforce combining multiple `Array#push`, `Element#classList.{ add, remove }()` or `importScripts` into one call
  'unicorn/prefer-single-call': ERROR,
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
  // require non-empty specifier list in import and export statements
  'unicorn/require-module-specifiers': ERROR,
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
  // alternatives in regular expressions should be grouped when used with anchors
  'sonarjs/anchor-precedence': ERROR,
  // arguments to built-in functions should match documented types
  'sonarjs/argument-type': OFF, // it seems does not work
  // bitwise operators should not be used in boolean contexts
  'sonarjs/bitwise-operators': ERROR,
  // function call arguments should not start on new lines
  'sonarjs/call-argument-line': ERROR,
  // class names should comply with a naming convention
  'sonarjs/class-name': [ERROR, { format: '^[A-Z$][a-zA-Z0-9]*$' }],
  // comma and logical `OR` operators should not be used in switch cases
  'sonarjs/comma-or-logical-or-case': ERROR,
  // cyclomatic complexity of functions should not be too high
  'sonarjs/cyclomatic-complexity': [OFF, { threshold: 16 }],
  // expressions should not be too complex
  'sonarjs/expression-complexity': [OFF, { max: 3 }],
  // `in` should not be used with primitive types
  'sonarjs/in-operator-type-error': ERROR,
  // functions should be called consistently with or without `new`
  'sonarjs/inconsistent-function-call': ERROR,
  // `new` should only be used with functions and classes
  'sonarjs/new-operator-misuse': [ERROR, { considerJSDoc: false }],
  // `Array#{ sort, toSorted }` should use a compare function
  'sonarjs/no-alphabetical-sort': ERROR,
  // `delete` should not be used on arrays
  'sonarjs/no-array-delete': ERROR,
  // array indexes should be numeric
  'sonarjs/no-associative-arrays': ERROR,
  // `switch` statements should not contain non-case labels
  'sonarjs/no-case-label-in-switch': ERROR,
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
  // `for-in` should not be used with iterables
  'sonarjs/no-for-in-iterable': ERROR,
  // global `this` object should not be used
  'sonarjs/no-global-this': ERROR,
  // boolean expressions should not be gratuitous
  'sonarjs/no-gratuitous-expressions': ERROR,
  // `in` should not be used on arrays
  'sonarjs/no-in-misuse': ERROR,
  // strings and non-strings should not be added
  'sonarjs/no-incorrect-string-concat': ERROR,
  // function returns should not be invariant
  'sonarjs/no-invariant-returns': ERROR,
  // literals should not be used as functions
  'sonarjs/no-literal-call': ERROR,
  // array-mutating methods should not be used misleadingly
  'sonarjs/no-misleading-array-reverse': ERROR,
  // assignments should not be redundant
  'sonarjs/no-redundant-assignments': ERROR,
  // boolean literals should not be redundant
  'sonarjs/no-redundant-boolean': ERROR,
  // jump statements should not be redundant
  'sonarjs/no-redundant-jump': ERROR,
  // redundant pairs of parentheses should be removed
  'sonarjs/no-redundant-parentheses': ERROR,
  // variables should be defined before being used
  'sonarjs/no-reference-error': ERROR,
  // conditionals should start on new lines
  'sonarjs/no-same-line-conditional': ERROR,
  // `switch` statements should have at least 3 `case` clauses
  'sonarjs/no-small-switch': ERROR,
  // promise rejections should not be caught by `try` blocks
  'sonarjs/no-try-promise': ERROR,
  // `undefined` should not be passed as the value of optional parameters
  'sonarjs/no-undefined-argument': ERROR,
  // errors should not be created without being thrown
  'sonarjs/no-unthrown-error': ERROR,
  // collection and array contents should be used
  'sonarjs/no-unused-collection': ERROR,
  // the output of functions that don't return anything should not be used
  'sonarjs/no-use-of-empty-return-value': ERROR,
  // values should not be uselessly incremented
  'sonarjs/no-useless-increment': ERROR,
  // non-existent operators `=+`, `=-` and `=!` should not be used
  'sonarjs/non-existent-operator': ERROR,
  // properties of variables with `null` or `undefined` values should not be accessed
  'sonarjs/null-dereference': ERROR, // it seems does not work
  // arithmetic operations should not result in `NaN`
  'sonarjs/operation-returning-nan': ERROR,
  // local variables should not be declared and then immediately returned or thrown
  'sonarjs/prefer-immediate-return': ERROR,
  // object literal syntax should be used
  'sonarjs/prefer-object-literal': ERROR,
  // shorthand promises should be used
  'sonarjs/prefer-promise-shorthand': ERROR,
  // return of boolean expressions should not be wrapped into an `if-then-else` statement
  'sonarjs/prefer-single-boolean-return': ERROR,
  // a `while` loop should be used instead of a `for` loop with condition only
  'sonarjs/prefer-while': ERROR,
  // using slow regular expressions is security-sensitive
  'sonarjs/slow-regex': ERROR,
  // regular expressions with the global flag should be used with caution
  'sonarjs/stateful-regex': ERROR,
  // comparison operators should not be used with strings
  'sonarjs/strings-comparison': ERROR,
  // `super()` should be invoked appropriately
  'sonarjs/super-invocation': ERROR,
  // results of operations on strings should not be ignored
  'sonarjs/useless-string-operation': ERROR,
  // values not convertible to numbers should not be used in numeric comparisons
  'sonarjs/values-not-convertible-to-numbers': ERROR,

  // math
  // enforce the conversion to absolute values to be the method you prefer
  'math/abs': [ERROR, { prefer: 'Math.abs' }],
  // disallow static calculations that go to infinity
  'math/no-static-infinity-calculations': ERROR,
  // disallow static calculations that go to `NaN`
  'math/no-static-nan-calculations': ERROR,
  // enforce the use of exponentiation (`**`) operator instead of other calculations
  'math/prefer-exponentiation-operator': ERROR,
  // enforce the use of `Math.cbrt()` instead of other cube root calculations
  'math/prefer-math-cbrt': ERROR,
  // enforce the use of `Math.E` instead of other ways
  'math/prefer-math-e': ERROR,
  // enforce the use of `Math.hypot()` instead of other hypotenuse calculations
  'math/prefer-math-hypot': ERROR,
  // enforce the use of `Math.LN10` instead of other ways
  'math/prefer-math-ln10': ERROR,
  // enforce the use of `Math.LN2` instead of other ways
  'math/prefer-math-ln2': ERROR,
  // enforce the use of `Math.log10` instead of other ways
  'math/prefer-math-log10': ERROR,
  // enforce the use of `Math.LOG10E` instead of other ways
  'math/prefer-math-log10e': ERROR,
  // enforce the use of `Math.log2` instead of other ways
  'math/prefer-math-log2': ERROR,
  // enforce the use of `Math.LOG2E` instead of other ways
  'math/prefer-math-log2e': ERROR,
  // enforce the use of `Math.PI` instead of literal number
  'math/prefer-math-pi': ERROR,
  // enforce the use of `Math.sqrt()` instead of other square root calculations
  'math/prefer-math-sqrt': ERROR,
  // enforce the use of `Math.SQRT1_2` instead of other ways
  'math/prefer-math-sqrt1-2': ERROR,
  // enforce the use of `Math.SQRT2` instead of other ways
  'math/prefer-math-sqrt2': ERROR,
  // enforce the use of `Math.sumPrecise()` instead of other summation methods
  'math/prefer-math-sum-precise': ERROR,
  // enforce the use of `Math.trunc()` instead of other truncations
  'math/prefer-math-trunc': [ERROR, { reportBitwise: false }],
  // enforce the use of `Number.EPSILON` instead of other ways
  'math/prefer-number-epsilon': ERROR,
  // enforce the use of `Number.isFinite()` instead of other checking ways
  'math/prefer-number-is-finite': ERROR,
  // enforce the use of `Number.isInteger()` instead of other checking ways
  'math/prefer-number-is-integer': ERROR,
  // enforce the use of `Number.isNaN()` instead of other checking ways
  'math/prefer-number-is-nan': ERROR,
  // enforce the use of `Number.isSafeInteger()` instead of other checking ways
  'math/prefer-number-is-safe-integer': ERROR,
  // enforce the use of `Number.MAX_SAFE_INTEGER` instead of other ways
  'math/prefer-number-max-safe-integer': ERROR,
  // enforce the use of `Number.MAX_VALUE` instead of literal number
  'math/prefer-number-max-value': ERROR,
  // enforce the use of `Number.MIN_SAFE_INTEGER` instead of other ways
  'math/prefer-number-min-safe-integer': ERROR,
  // enforce the use of `Number.MIN_VALUE` instead of literal number
  'math/prefer-number-min-value': ERROR,

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
  'redos/no-vulnerable': [ERROR, { timeout: 1e3 }],

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

  // suggest better alternatives to some dependencies
  'depend/ban-dependencies': [ERROR, { allowed: [
    'mkdirp', // TODO: drop from `core-js@4`
  ] }],
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
  '@stylistic/comma-dangle': [ERROR, NEVER],
  // require or disallow use of quotes around object literal property names
  '@stylistic/quote-props': [ERROR, 'as-needed', { keywords: true }],
  // enforce the use of exponentiation (`**`) operator instead of other calculations
  'math/prefer-exponentiation-operator': OFF,
  // prefer lookarounds over capturing group that do not replace
  'regexp/prefer-lookaround': [ERROR, { lookbehind: false, strictTypes: true }],
  // enforce using named capture group in regular expression
  'regexp/prefer-named-capture-group': OFF,
  // prefer class field declarations over this assignments in constructors
  'unicorn/prefer-class-fields': OFF,
  // prefer default parameters over reassignment
  'unicorn/prefer-default-parameters': OFF,
  // prefer using a logical operator over a ternary
  'unicorn/prefer-logical-operator-over-ternary': OFF,
  // prefer omitting the `catch` binding parameter
  'unicorn/prefer-optional-catch-binding': OFF,
};

const forbidNonStandardBuiltIns = {
  // disallow non-standard built-in methods
  'es/no-nonstandard-array-properties': ERROR,
  'es/no-nonstandard-array-prototype-properties': ERROR,
  'es/no-nonstandard-arraybuffer-properties': ERROR,
  'es/no-nonstandard-arraybuffer-prototype-properties': ERROR,
  'es/no-nonstandard-asyncdisposablestack-properties': ERROR,
  'es/no-nonstandard-asyncdisposablestack-prototype-properties': ERROR,
  'es/no-nonstandard-atomics-properties': ERROR,
  'es/no-nonstandard-bigint-properties': ERROR,
  'es/no-nonstandard-bigint-prototype-properties': ERROR,
  'es/no-nonstandard-boolean-properties': ERROR,
  'es/no-nonstandard-boolean-prototype-properties': ERROR,
  'es/no-nonstandard-dataview-properties': ERROR,
  'es/no-nonstandard-dataview-prototype-properties': ERROR,
  'es/no-nonstandard-date-properties': ERROR,
  'es/no-nonstandard-date-prototype-properties': ERROR,
  'es/no-nonstandard-disposablestack-properties': ERROR,
  'es/no-nonstandard-disposablestack-prototype-properties': ERROR,
  'es/no-nonstandard-error-properties': ERROR,
  'es/no-nonstandard-finalizationregistry-properties': ERROR,
  'es/no-nonstandard-finalizationregistry-prototype-properties': ERROR,
  'es/no-nonstandard-function-properties': ERROR,
  'es/no-nonstandard-intl-collator-properties': ERROR,
  'es/no-nonstandard-intl-collator-prototype-properties': ERROR,
  'es/no-nonstandard-intl-datetimeformat-properties': ERROR,
  'es/no-nonstandard-intl-datetimeformat-prototype-properties': ERROR,
  'es/no-nonstandard-intl-displaynames-properties': ERROR,
  'es/no-nonstandard-intl-displaynames-prototype-properties': ERROR,
  'es/no-nonstandard-intl-listformat-properties': ERROR,
  'es/no-nonstandard-intl-listformat-prototype-properties': ERROR,
  'es/no-nonstandard-intl-locale-properties': ERROR,
  'es/no-nonstandard-intl-locale-prototype-properties': ERROR,
  'es/no-nonstandard-intl-numberformat-properties': ERROR,
  'es/no-nonstandard-intl-numberformat-prototype-properties': ERROR,
  'es/no-nonstandard-intl-pluralrules-properties': ERROR,
  'es/no-nonstandard-intl-pluralrules-prototype-properties': ERROR,
  'es/no-nonstandard-intl-properties': ERROR,
  'es/no-nonstandard-intl-relativetimeformat-properties': ERROR,
  'es/no-nonstandard-intl-relativetimeformat-prototype-properties': ERROR,
  'es/no-nonstandard-intl-segmenter-properties': ERROR,
  'es/no-nonstandard-intl-segmenter-prototype-properties': ERROR,
  'es/no-nonstandard-iterator-properties': ERROR,
  'es/no-nonstandard-iterator-prototype-properties': ERROR,
  'es/no-nonstandard-json-properties': ERROR,
  'es/no-nonstandard-map-properties': ERROR,
  'es/no-nonstandard-map-prototype-properties': ERROR,
  'es/no-nonstandard-math-properties': ERROR,
  'es/no-nonstandard-number-properties': ERROR,
  'es/no-nonstandard-number-prototype-properties': ERROR,
  'es/no-nonstandard-object-properties': ERROR,
  'es/no-nonstandard-promise-properties': ERROR,
  'es/no-nonstandard-promise-prototype-properties': ERROR,
  'es/no-nonstandard-proxy-properties': ERROR,
  'es/no-nonstandard-reflect-properties': ERROR,
  'es/no-nonstandard-regexp-properties': ERROR,
  'es/no-nonstandard-regexp-prototype-properties': ERROR,
  'es/no-nonstandard-set-properties': ERROR,
  'es/no-nonstandard-set-prototype-properties': ERROR,
  'es/no-nonstandard-sharedarraybuffer-properties': ERROR,
  'es/no-nonstandard-sharedarraybuffer-prototype-properties': ERROR,
  'es/no-nonstandard-string-properties': ERROR,
  'es/no-nonstandard-string-prototype-properties': ERROR,
  'es/no-nonstandard-symbol-properties': [ERROR, { allow: [
    'sham', // non-standard flag
  ] }],
  'es/no-nonstandard-symbol-prototype-properties': ERROR,
  'es/no-nonstandard-typed-array-properties': ERROR,
  'es/no-nonstandard-typed-array-prototype-properties': ERROR,
  'es/no-nonstandard-weakmap-properties': ERROR,
  'es/no-nonstandard-weakmap-prototype-properties': ERROR,
  'es/no-nonstandard-weakref-properties': ERROR,
  'es/no-nonstandard-weakref-prototype-properties': ERROR,
  'es/no-nonstandard-weakset-properties': ERROR,
  'es/no-nonstandard-weakset-prototype-properties': ERROR,
};

const forbidCompletelyNonExistentBuiltIns = {
  ...forbidNonStandardBuiltIns,
  // disallow non-standard built-in methods
  'es/no-nonstandard-array-properties': [ERROR, { allow: [
    'isTemplateObject',
  ] }],
  'es/no-nonstandard-array-prototype-properties': [ERROR, { allow: [
    'filterReject',
    'uniqueBy',
    // TODO: drop from `core-js@4`
    'filterOut',
    'group',
    'groupBy',
    'groupByToMap',
    'groupToMap',
    'lastIndex',
    'lastItem',
  ] }],
  'es/no-nonstandard-bigint-properties': [ERROR, { allow: [
    // TODO: drop from `core-js@4`
    'range',
  ] }],
  'es/no-nonstandard-dataview-prototype-properties': [ERROR, { allow: [
    'getUint8Clamped',
    'setUint8Clamped',
  ] }],
  'es/no-nonstandard-function-properties': [ERROR, { allow: [
    'isCallable',
    'isConstructor',
  ] }],
  'es/no-nonstandard-iterator-properties': [ERROR, { allow: [
    'concat',
    'range',
    'zip',
    'zipKeyed',
  ] }],
  'es/no-nonstandard-iterator-prototype-properties': [ERROR, { allow: [
    'chunks',
    'sliding',
    'toAsync',
    'windows',
    // TODO: drop from `core-js@4`
    'asIndexedPairs',
    'indexed',
  ] }],
  'es/no-nonstandard-json-properties': [ERROR, { allow: [
    'isRawJSON',
    'rawJSON',
  ] }],
  'es/no-nonstandard-map-properties': [ERROR, { allow: [
    'from',
    'of',
    // TODO: drop from `core-js@4`
    'keyBy',
  ] }],
  'es/no-nonstandard-map-prototype-properties': [ERROR, { allow: [
    'getOrInsert',
    'getOrInsertComputed',
    // TODO: drop from `core-js@4`
    'deleteAll',
    'emplace',
    'every',
    'filter',
    'find',
    'findKey',
    'includes',
    'keyOf',
    'mapKeys',
    'mapValues',
    'merge',
    'reduce',
    'some',
    'update',
    'updateOrInsert',
    'upsert',
  ] }],
  'es/no-nonstandard-math-properties': [ERROR, { allow: [
    'sumPrecise',
    // TODO: drop from `core-js@4`
    'DEG_PER_RAD',
    'RAD_PER_DEG',
    'clamp',
    'degrees',
    'fscale',
    'iaddh',
    'imulh',
    'isubh',
    'radians',
    'scale',
    'seededPRNG',
    'signbit',
    'umulh',
  ] }],
  'es/no-nonstandard-number-properties': [ERROR, { allow: [
    // TODO: drop from `core-js@4`
    'fromString',
    'range',
  ] }],
  'es/no-nonstandard-number-prototype-properties': [ERROR, { allow: [
    'clamp',
  ] }],
  'es/no-nonstandard-object-properties': [ERROR, { allow: [
    // TODO: drop from `core-js@4`
    'iterateEntries',
    'iterateKeys',
    'iterateValues',
  ] }],
  'es/no-nonstandard-reflect-properties': [ERROR, { allow: [
    // TODO: drop from `core-js@4`
    'defineMetadata',
    'deleteMetadata',
    'getMetadata',
    'getMetadataKeys',
    'getOwnMetadata',
    'getOwnMetadataKeys',
    'hasMetadata',
    'hasOwnMetadata',
    'metadata',
  ] }],
  'es/no-nonstandard-set-properties': [ERROR, { allow: [
    'from',
    'of',
  ] }],
  'es/no-nonstandard-set-prototype-properties': [ERROR, { allow: [
    // TODO: drop from `core-js@4`
    'addAll',
    'deleteAll',
    'every',
    'filter',
    'find',
    'join',
    'map',
    'reduce',
    'some',
  ] }],
  'es/no-nonstandard-string-properties': [ERROR, { allow: [
    'cooked',
    'dedent',
  ] }],
  'es/no-nonstandard-string-prototype-properties': [ERROR, { allow: [
    // TODO: drop from `core-js@4`
    'codePoints',
  ] }],
  'es/no-nonstandard-symbol-properties': [ERROR, { allow: [
    'customMatcher',
    'isRegisteredSymbol',
    'isWellKnownSymbol',
    'metadata',
    'sham', // non-standard flag
    // TODO: drop from `core-js@4`
    'isRegistered',
    'isWellKnown',
    'matcher',
    'metadataKey',
    'observable',
    'patternMatch',
    'replaceAll',
    'useSetter',
    'useSimple',
  ] }],
  'es/no-nonstandard-typed-array-properties': [ERROR, { allow: [
    'fromBase64',
    'fromHex',
    // TODO: drop from `core-js@4`
    'fromAsync',
  ] }],
  'es/no-nonstandard-typed-array-prototype-properties': [ERROR, { allow: [
    'filterReject',
    'uniqueBy',
    // TODO: drop from `core-js@4`
    'filterOut',
    'groupBy',
    'setFromBase64',
    'setFromHex',
    'toBase64',
    'toHex',
    'toSpliced',
  ] }],
  'es/no-nonstandard-weakmap-properties': [ERROR, { allow: [
    'from',
    'of',
  ] }],
  'es/no-nonstandard-weakmap-prototype-properties': [ERROR, { allow: [
    'getOrInsert',
    'getOrInsertComputed',
    // TODO: drop from `core-js@4`
    'deleteAll',
    'emplace',
    'upsert',
  ] }],
  'es/no-nonstandard-weakset-properties': [ERROR, { allow: [
    'from',
    'of',
  ] }],
  'es/no-nonstandard-weakset-prototype-properties': [ERROR, { allow: [
    // TODO: drop from `core-js@4`
    'addAll',
    'deleteAll',
  ] }],
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
  // prefer `globalThis` over `window`, `self`, and `global`
  'unicorn/prefer-global-this': OFF,
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
  // enforce the use of `Math.cbrt()` instead of other cube root calculations
  'math/prefer-math-cbrt': OFF,
  // enforce the use of `Math.hypot()` instead of other hypotenuse calculations
  'math/prefer-math-hypot': OFF,
  // enforce the use of `Math.log10` instead of other ways
  'math/prefer-math-log10': OFF,
  // enforce the use of `Math.log10` instead of other ways
  'math/prefer-math-log2': OFF,
  // enforce the use of `Math.trunc()` instead of other truncations
  'math/prefer-math-trunc': OFF,
  // enforce the use of `Number.EPSILON` instead of other ways
  'math/prefer-number-epsilon': OFF,
  // enforce the use of `Number.isFinite()` instead of other checking ways
  'math/prefer-number-is-finite': OFF,
  // enforce the use of `Number.isInteger()` instead of other checking ways
  'math/prefer-number-is-integer': OFF,
  // enforce the use of `Number.isNaN()` instead of other checking ways
  'math/prefer-number-is-nan': OFF,
  // enforce the use of `Number.isSafeInteger()` instead of other checking ways
  'math/prefer-number-is-safe-integer': OFF,
  // enforce the use of `Number.MAX_SAFE_INTEGER` instead of other ways
  'math/prefer-number-max-safe-integer': OFF,
  // enforce the use of `Number.MIN_SAFE_INTEGER` instead of other ways
  'math/prefer-number-min-safe-integer': OFF,
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
  'es/no-symbol-matchall': ERROR,
  // prefer `BigInt` literals over the constructor
  'unicorn/prefer-bigint-literals': OFF,
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
  'es/no-array-prototype-at': ERROR,
  'es/no-error-cause': ERROR,
  'es/no-object-hasown': ERROR,
  'es/no-regexp-d-flag': ERROR,
  'es/no-regexp-unicode-property-escapes-2022': ERROR,
  'es/no-string-prototype-at': ERROR,
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
  // prefer `Array#toReversed()` over `Array#reverse()`
  'unicorn/no-array-reverse': OFF,
};

const forbidES2024BuiltIns = {
  'es/no-arraybuffer-prototype-transfer': ERROR,
  'es/no-atomics-waitasync': ERROR,
  'es/no-map-groupby': ERROR,
  'es/no-object-groupby': ERROR,
  'es/no-promise-withresolvers': ERROR,
  'es/no-regexp-v-flag': ERROR,
  'es/no-resizable-and-growable-arraybuffers': ERROR,
  'es/no-string-prototype-iswellformed': ERROR,
  'es/no-string-prototype-towellformed': ERROR,
};

const forbidES2025BuiltIns = {
  'es/no-dataview-prototype-getfloat16-setfloat16': ERROR,
  'es/no-float16array': ERROR,
  'es/no-iterator': ERROR,
  'es/no-iterator-prototype-drop': ERROR,
  'es/no-iterator-prototype-every': ERROR,
  'es/no-iterator-prototype-filter': ERROR,
  'es/no-iterator-prototype-find': ERROR,
  'es/no-iterator-prototype-flatmap': ERROR,
  'es/no-iterator-prototype-foreach': ERROR,
  'es/no-iterator-prototype-map': ERROR,
  'es/no-iterator-prototype-reduce': ERROR,
  'es/no-iterator-prototype-some': ERROR,
  'es/no-iterator-prototype-take': ERROR,
  'es/no-iterator-prototype-toarray': ERROR,
  'es/no-math-f16round': ERROR,
  'es/no-promise-try': ERROR,
  'es/no-set-prototype-difference': ERROR,
  'es/no-set-prototype-intersection': ERROR,
  'es/no-set-prototype-isdisjointfrom': ERROR,
  'es/no-set-prototype-issubsetof': ERROR,
  'es/no-set-prototype-issupersetof': ERROR,
  'es/no-set-prototype-symmetricdifference': ERROR,
  'es/no-set-prototype-union': ERROR,
};

const forbidES2026BuiltIns = {
  'es/no-array-fromasync': ERROR,
  'es/no-asyncdisposablestack': ERROR,
  'es/no-error-iserror': ERROR,
  'es/no-math-sumprecise': ERROR,
  'es/no-suppressederror': ERROR,
  'es/no-symbol-asyncdispose': ERROR,
  'es/no-symbol-dispose': ERROR,
  'es/no-uint8array-frombase64': ERROR,
  'es/no-uint8array-fromhex': ERROR,
  'es/no-uint8array-prototype-setfrombase64': ERROR,
  'es/no-uint8array-prototype-setfromhex': ERROR,
  'es/no-uint8array-prototype-tobase64': ERROR,
  'es/no-uint8array-prototype-tohex': ERROR,
  // enforce the use of `Math.sumPrecise` instead of other summation methods
  'math/prefer-math-sum-precise': OFF,
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

const forbidES2025IntlBuiltIns = {
  'es/no-intl-durationformat': ERROR,
};

const forbidSomeES2025Syntax = {
  'es/no-regexp-duplicate-named-capturing-groups': ERROR,
  'es/no-regexp-modifiers': ERROR,
  'es/no-import-attributes': ERROR,
  'es/no-dynamic-import-options': ERROR,
  'es/no-trailing-dynamic-import-commas': ERROR,
  'es/no-json-modules': ERROR,
};

const forbidModernBuiltIns = {
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
  ...forbidES2025BuiltIns,
  ...forbidES2026BuiltIns,
  ...forbidES2016IntlBuiltIns,
  ...forbidES2017IntlBuiltIns,
  ...forbidES2018IntlBuiltIns,
  ...forbidES2020IntlBuiltIns,
  ...forbidES2021IntlBuiltIns,
  ...forbidES2022IntlBuiltIns,
  ...forbidES2023IntlBuiltIns,
  ...forbidES2025IntlBuiltIns,
  // prefer using `structuredClone` to create a deep clone
  'unicorn/prefer-structured-clone': OFF,
};

const polyfills = {
  // prefer `node:` protocol
  'node/prefer-node-protocol': OFF,
  // enforces the use of `catch()` on un-returned promises
  'promise/catch-or-return': OFF,
  // avoid nested `then()` or `catch()` statements
  'promise/no-nesting': OFF,
  // prefer catch to `then(a, b)` / `then(null, b)` for handling errors
  'promise/prefer-catch': OFF,
  // prefer `RegExp#test()` over `String#match()` and `RegExp#exec()`
  // use `RegExp#exec()` since it does not have implicit calls under the hood
  'regexp/prefer-regexp-test': OFF,
  // shorthand promises should be used
  'sonarjs/prefer-promise-shorthand': OFF,
  // disallow `instanceof` with built-in objects
  'unicorn/no-instanceof-builtins': OFF,
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
  // disallow duplicate named capture groups
  'es/no-regexp-duplicate-named-capturing-groups': OFF,
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
  // prefer `BigInt` literals over the constructor
  'unicorn/prefer-bigint-literals': OFF,
  ...forbidSomeES2025Syntax,
  ...forbidCompletelyNonExistentBuiltIns,
};

const nodePackages = {
  // disallow logical assignment operator shorthand
  'logical-assignment-operators': [ERROR, NEVER],
  // disallow unsupported ECMAScript built-ins on the specified version
  'node/no-unsupported-features/node-builtins': [ERROR, { version: PACKAGES_NODE_VERSIONS, allowExperimental: false }],
  // prefer `node:` protocol
  'node/prefer-node-protocol': OFF,
  // prefer promises
  'node/prefer-promises/dns': OFF,
  'node/prefer-promises/fs': OFF,
  // prefer lookarounds over capturing group that do not replace
  'regexp/prefer-lookaround': [ERROR, { lookbehind: false, strictTypes: true }],
  // enforce using named capture group in regular expression
  'regexp/prefer-named-capture-group': OFF,
  // prefer class field declarations over this assignments in constructors
  'unicorn/prefer-class-fields': OFF,
  // prefer using a logical operator over a ternary
  'unicorn/prefer-logical-operator-over-ternary': OFF,
  // prefer using the `node:` protocol when importing Node builtin modules
  'unicorn/prefer-node-protocol': OFF,
  // prefer omitting the `catch` binding parameter
  'unicorn/prefer-optional-catch-binding': OFF,
  // prefer using `structuredClone` to create a deep clone
  'unicorn/prefer-structured-clone': OFF,
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
  ...forbidES2025BuiltIns,
  ...forbidES2026BuiltIns,
  ...disable(forbidES2016IntlBuiltIns),
  ...disable(forbidES2017IntlBuiltIns),
  ...forbidES2018IntlBuiltIns,
  ...forbidES2020IntlBuiltIns,
  ...forbidES2021IntlBuiltIns,
  ...forbidES2022IntlBuiltIns,
  ...forbidES2023IntlBuiltIns,
  ...forbidES2025IntlBuiltIns,
  ...forbidSomeES2025Syntax,
};

const nodeDev = {
  // disallow unsupported ECMAScript built-ins on the specified version
  'node/no-unsupported-features/node-builtins': [ERROR, { version: DEV_NODE_VERSIONS, ignores: ['fetch'], allowExperimental: false }],
  ...disable(forbidModernBuiltIns),
  ...forbidES2023BuiltIns,
  'es/no-array-prototype-findlast-findlastindex': OFF,
  ...forbidES2024BuiltIns,
  ...forbidES2025BuiltIns,
  ...forbidES2026BuiltIns,
  'es/no-intl-supportedvaluesof': ERROR,
  ...forbidES2023IntlBuiltIns,
  ...forbidES2025IntlBuiltIns,
  // ReDoS vulnerability check
  'redos/no-vulnerable': OFF,
  // prefer top-level await
  'unicorn/prefer-top-level-await': ERROR,
  ...forbidSomeES2025Syntax,
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
  '@stylistic/max-len': [ERROR, { ...base['@stylistic/max-len'][1], code: 180 }],
  // enforces the use of `catch()` on un-returned promises
  'promise/catch-or-return': OFF,
  // prefer catch to `then(a, b)` / `then(null, b)` for handling errors
  'promise/prefer-catch': OFF,
  // shorthand promises should be used
  'sonarjs/prefer-promise-shorthand': OFF,
  // enforce passing a message value when throwing a built-in error
  'unicorn/error-message': OFF,
  // prefer `Array#toReversed()` over `Array#reverse()`
  'unicorn/no-array-reverse': OFF,
  // disallow immediate mutation after variable assignment
  'unicorn/no-immediate-mutation': OFF,
  // disallow `instanceof` with built-in objects
  'unicorn/no-instanceof-builtins': OFF,
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

const yaml = {
  // disallow empty mapping values
  'yaml/no-empty-mapping-value': ERROR,
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
  'jsonc/no-irregular-whitespace': [ERROR, {}],
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
  '@stylistic/max-len': OFF,
  // require strict mode directives
  strict: OFF,
};

const packageJSON = {
  // enforce consistent format for the exports field (implicit or explicit subpaths)
  'package-json/exports-subpaths-style': [ERROR, { prefer: 'explicit' }],
  // reports on unnecessary empty arrays and objects
  'package-json/no-empty-fields': ERROR,
  // prevents adding unnecessary / redundant files
  'package-json/no-redundant-files': ERROR,
  // enforce that package dependencies are unique
  'package-json/unique-dependencies': ERROR,
  // enforce that the author field is a valid npm author specification
  'package-json/valid-author': ERROR,
  // enforce that the `bundleDependencies` (or `bundledDependencies`) property is valid
  'package-json/valid-bundleDependencies': ERROR,
  // enforce that the `bin` property is valid
  'package-json/valid-bin': ERROR,
  // enforce that the `config` property is valid
  'package-json/valid-config': ERROR,
  // enforce that the `cpu` property is valid
  'package-json/valid-cpu': ERROR,
  // enforce that the `dependencies` property is valid
  'package-json/valid-dependencies': ERROR,
  // enforce that the `description` property is valid
  'package-json/valid-description': ERROR,
  // enforce that the `directories` property is valid
  'package-json/valid-directories': ERROR,
  // enforce that the `exports` property is valid
  'package-json/valid-exports': ERROR,
  // enforce that the `license` property is valid
  'package-json/valid-license': ERROR,
  // enforce that if repository directory is specified, it matches the path to the package.json file
  'package-json/valid-repository-directory': ERROR,
  // enforce that the `scripts` property is valid.
  'package-json/valid-scripts': ERROR,
  // enforce that the `type` property is valid
  'package-json/valid-type': ERROR,
  // enforce that package versions are valid semver specifiers
  'package-json/valid-version': ERROR,
};

const packagesPackageJSON = {
  // enforce either object or shorthand declaration for repository
  'package-json/repository-shorthand': [ERROR, { form: 'object' }],
  // requires the `author` property to be present
  'package-json/require-author': ERROR,
  // requires the `bugs`` property to be present
  'package-json/require-bugs': ERROR,
  // requires the `description` property to be present
  'package-json/require-description': ERROR,
  // requires the `engines` property to be present
  // TODO: core-js@4
  // 'package-json/require-engines': ERROR,
  // requires the `license` property to be present
  'package-json/require-license': ERROR,
  // requires the `name` property to be present
  'package-json/require-name': ERROR,
  // requires the `types` property to be present
  // TODO: core-js@4
  // 'package-json/require-types': ERROR,
  // requires the `version` property to be present
  'package-json/require-version': ERROR,
  // enforce that package names are valid npm package names
  'package-json/valid-name': ERROR,
};

const nodeDependencies = {
  // enforce the versions of the engines of the dependencies to be compatible
  'node-dependencies/compat-engines': ERROR,
  // disallow having dependencies on deprecate packages
  'node-dependencies/no-deprecated': ERROR,
  // enforce versions that is valid as a semantic version
  'node-dependencies/valid-semver': ERROR,
};

const markdown = {
  ...base,
  ...disable(forbidModernBuiltIns),
  ...forbidCompletelyNonExistentBuiltIns,
  // allow use of console
  'no-console': OFF,
  // disallow use of new operator when not part of the assignment or comparison
  'no-new': OFF,
  // disallow specified syntax
  'no-restricted-syntax': OFF,
  // disallow use of undeclared variables unless mentioned in a /*global */ block
  'no-undef': OFF,
  // disallow usage of expressions in statement position
  'no-unused-expressions': OFF,
  // disallow declaration of variables that are not used in the code
  'no-unused-vars': OFF,
  // require let or const instead of var
  'no-var': OFF,
  // require const declarations for variables that are never reassigned after declared
  'prefer-const': OFF,
  // disallow use of the `RegExp` constructor in favor of regular expression literals
  'prefer-regex-literals': OFF,
  // disallow top-level `await`
  'es/no-top-level-await': OFF,
  // ensure imports point to files / modules that can be resolved
  'import/no-unresolved': OFF,
  // enforces the use of `catch()` on un-returned promises
  'promise/catch-or-return': OFF,
  // enforce that `RegExp#exec` is used instead of `String#match` if no global flag is provided
  'regexp/prefer-regexp-exec': OFF,
  // variables should be defined before being used
  'sonarjs/no-reference-error': OFF,
  // specify the maximum length of a line in your program
  '@stylistic/max-len': [ERROR, { ...base['@stylistic/max-len'][1], code: 200 }],
};

const globalsESNext = {
  AsyncIterator: READONLY,
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
      'website/dist/**',
      'website/src/public/*',
      'website/templates/**',
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
      '@stylistic': pluginStylistic,
      'array-func': pluginArrayFunc,
      ascii: pluginASCII,
      canonical: pluginCanonical,
      depend: pluginDepend,
      es: pluginESX,
      'eslint-comments': pluginESlintComments,
      import: pluginImport,
      jsonc: pluginJSONC,
      markdown: pluginMarkdown,
      math: pluginMath,
      node: pluginN,
      'node-dependencies': pluginNodeDependencies,
      'package-json': pluginPackageJSON,
      promise: pluginPromise,
      qunit: pluginQUnit,
      redos: pluginReDoS,
      regexp: pluginRegExp,
      sonarjs: pluginSonarJS,
      unicorn: pluginUnicorn,
      yaml: pluginYaml,
    },
    rules: {
      ...base,
      ...forbidNonStandardBuiltIns,
      ...forbidESAnnexBBuiltIns,
    },
    settings: {
      'es-x': { allowTestedProperty: true },
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
      'tests/@(helpers|unit-pure|worker)/**',
      'tests/compat/@(browsers|hermes|node|rhino)-runner.js',
    ],
    rules: forbidModernBuiltIns,
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
      'packages/core-js?(-pure)/**/instance/**',
    ],
    rules: {
      ...disable(forbidModernBuiltIns),
      ...forbidCompletelyNonExistentBuiltIns,
    },
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
      'tests/compat/tests.js',
    ],
    rules: forbidCompletelyNonExistentBuiltIns,
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
      'website/runner.mjs',
      'website/helpers.mjs',
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
      'website/*.mjs',
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
      'import/no-unresolved': OFF,
    },
  },
  {
    rules: {
      // ensure that filenames match a convention
      'canonical/filename-match-regex': [ERROR, { regex: '^[\\da-z]|[a-z][\\d\\-.a-z]*[\\da-z]$' }],
    },
  },
  {
    files: [
      'packages/core-js?(-pure)/modules/**',
    ],
    rules: {
      // ensure that filenames match a convention
      'canonical/filename-match-regex': [ERROR, { regex: '^(?:es|esnext|web)(?:\\.[a-z][\\d\\-a-z]*[\\da-z])+$' }],
    },
  },
  {
    files: [
      'tests/@(unit-@(global|pure))/**',
    ],
    rules: {
      // ensure that filenames match a convention
      'canonical/filename-match-regex': [ERROR, { regex: '^(?:es|esnext|helpers|web)(?:\\.[a-z][\\d\\-a-z]*[\\da-z])+$' }],
    },
  },
  {
    language: 'yaml/yaml',
    files: ['*.yaml', '*.yml'],
    rules: yaml,
  },
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: parserJSONC,
    },
    rules: json,
  },
  {
    files: ['**/package.json'],
    rules: {
      ...packageJSON,
      ...nodeDependencies,
    },
  },
  {
    files: ['packages/*/package.json'],
    rules: packagesPackageJSON,
  },
  {
    files: ['**/*.md'],
    processor: 'markdown/markdown',
  },
  {
    files: ['**/*.md/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: markdown,
  },
  {
    files: ['**/*.md/*'],
    rules: {
      // enforce a case style for filenames
      'unicorn/filename-case': OFF,
    },
  },
  {
    files: [
      'website/src/js/*',
    ],
    languageOptions: {
      sourceType: 'module',
    },
    rules: {
      ...transpiledAndPolyfilled,
      'import/no-unresolved': OFF,
      'no-restricted-globals': OFF,
      'unicorn/prefer-global-this': OFF,
      '@stylistic/quotes': [ERROR, 'single', { allowTemplateLiterals: ALWAYS }],
    },
  },
];
