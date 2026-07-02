// SE prefix on LHS of `in` with a symbol key: `(count++, Symbol.iterator) in obj`. the `in`
// handler must peel the parens and the SequenceExpression prefix so Symbol.iterator surfaces
// as the polyfill anchor; the prefix stays in the AST so `count++` still runs at runtime.
let count = 0;
const obj = {};
const has = (count++, Symbol.iterator) in obj;
console.log(has, count);