import _Array$from from "@core-js/pure/actual/array/from";
// parenthesized init `const { from } = (Array)` - parens must be peeled to
// resolve the right-hand side to `Array`, so destructuring `from` polyfills
// `Array.from`
const from = _Array$from;