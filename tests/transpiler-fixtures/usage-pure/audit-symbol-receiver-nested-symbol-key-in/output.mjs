import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _globalThis from "@core-js/pure/actual/global-this";
// nested `Symbol[Symbol.iterator]` as `in`-LHS receiver: user-broken — Symbol
// constructor itself is not iterable, so `Symbol[Symbol.iterator]` evaluates to
// undefined. plugin bails the `in` rewrite (no `_isIterable` synth on Symbol) but
// still polyfills the inner computed Symbol.iterator access via the iterator-method
// fast-path (consistent with other `Symbol[Symbol.iterator]` receivers)
const x = _getIteratorMethod(_Symbol) in obj;
_globalThis.__x = x;