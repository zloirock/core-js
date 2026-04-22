import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _globalThis from "@core-js/pure/actual/global-this";
// nested `Symbol[Symbol.iterator]` as `in`-LHS: `in` rewrite bails (Symbol is not
// iterable at runtime); inner computed Symbol.iterator access still polyfilled
const x = _getIteratorMethod(_Symbol) in obj;
_globalThis.__x = x;