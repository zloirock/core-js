import _DisposableStack from "@core-js/pure/actual/disposable-stack";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
// A `||` / `??` the user wrote over a left that always yields - one this build serves, a global core-js
// extends in place (`Array`), a bare global name nothing writes - folds to that left in pure, the dead right
// and the import it named gone. A left the build does not serve keeps both operands live - a global core-js
// does not implement read off the realm, one the census sees written, an unknown one.
export const weak = _WeakMap;
export const realm = _globalThis;
export const made = new _Promise(resolve => resolve());
export const unbacked = Array;
export const fetcher = _self.fetch || polyfillFetch;
export const patched = Symbol || (Symbol = shimSymbol);
export const maybe = pick() || _Set;
export const absent = _globalThis.WeakRef || _DisposableStack;