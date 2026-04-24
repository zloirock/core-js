import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// nested symbol-in-computed-key probe: `obj[Symbol[Symbol.iterator]] in x`.
// the inner `Symbol[Symbol.iterator]` should emit the iterator-method polyfill and
// `Symbol` itself should polyfill - without Symbol reuse tripping a cycle guard
obj[_getIteratorMethod(_Symbol)] in x;