import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
var _ref;
// nested `Symbol[Symbol.iterator]` LHS of `in` - the inner `Symbol.iterator` resolves
// to the well-known symbol; the outer Symbol-indexed access reads `Symbol[<symbolValue>]`
// which evaluates to undefined at runtime. handleBinaryIn first branch detects double-`.`
// shape (`Symbol.Symbol.iterator`) via `name.includes('.')` guard and bails. The second
// branch (resolveKey-based) sees the resolved string `Symbol.Symbol.iterator` whose
// double-prefix is filtered by `!resolvedLeft.includes('.', 7)`. Both guards prevent
// invalid Symbol.X polyfill dispatch
const a = _getIteratorMethod(_Symbol) in obj;
const b = _isIterable(arr);
_includesMaybeArray(_ref = [a, b]).call(_ref, true);