import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// `obj[Symbol[Symbol.iterator]]`: the OUTER property would resolve to a malformed
// `Symbol.Symbol.iterator`, so no outer polyfill emits. the INNER `Symbol[Symbol.iterator]`
// is a regular computed Symbol key and must still emit get-iterator-method on its own
const v = obj[_getIteratorMethod(_Symbol)];
export { v };