import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// extra parens around the computed key `Symbol[(Symbol.iterator)]` must not change the
// resolution: it still folds to `Symbol.iterator`, so the `in` check routes to
// get-iterator-method, not the doubly-prefixed `Symbol.Symbol.iterator`
const x = _getIteratorMethod(_Symbol) in obj;
export { x };