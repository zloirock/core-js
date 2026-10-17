// parenthesized init `const { from } = (Array)` - parens must be peeled to
// resolve the right-hand side to `Array`, so destructuring `from` polyfills
// `Array.from`
const { from } = (Array);
