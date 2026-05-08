// `obj[Symbol[Symbol.iterator]]`: the OUTER property would resolve to a malformed
// `Symbol.Symbol.iterator`, so no outer polyfill emits. the INNER `Symbol[Symbol.iterator]`
// is a regular computed Symbol key and must still emit get-iterator-method on its own
const v = obj[Symbol[Symbol.iterator]];
export { v };
