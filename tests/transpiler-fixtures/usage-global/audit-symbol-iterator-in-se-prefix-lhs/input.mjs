// SE prefix on LHS of `in` operator with symbol-sourced key: `(count++, Symbol.iterator) in obj`.
// the `in`-handler in detect-usage/members must walk past the SE through `unwrapParens` +
// `peelReceiverSequenceTail` so Symbol.iterator surfaces as the polyfill anchor; SE prefix
// stays in the AST so `count++` runs at runtime
let count = 0;
const obj = {};
const has = (count++, Symbol.iterator) in obj;
console.log(has, count);