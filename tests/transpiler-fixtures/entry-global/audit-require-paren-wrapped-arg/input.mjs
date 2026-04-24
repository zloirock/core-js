// `require(('core-js/actual/array/from'))` - string literal arg wrapped in ParenthesizedExpression
// under `createParenthesizedExpressions: true`. entry detection must peel the paren to match the
// specifier. no polyfill would be injected if the wrapper shadowed the literal from the checker
require(('core-js/actual/array/from'));
