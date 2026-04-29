// `require(('core-js/actual/array/from'))` - string literal arg wrapped in a paren
// wrapper when the parser keeps parens as AST nodes. Entry detection must peel the paren
// to match the specifier; without the peel, the wrapper hides the literal and no polyfill
// is injected
require(('core-js/actual/array/from'));
