// pure mode `Symbol.iterator` in computed-key inside spread: `{...{[Symbol.iterator]: f}}`.
// inner ObjectExpression has a computed Property key - `Symbol.iterator` accessor is
// polyfilled to `_Symbol$iterator`, the computed-key reference uses the polyfill binding.
// outer spread carries the inner object's keys to the result. covers computed-key-in-
// ObjectExpression-inside-spread shape
const obj = {...{ [Symbol.iterator]: f }};
