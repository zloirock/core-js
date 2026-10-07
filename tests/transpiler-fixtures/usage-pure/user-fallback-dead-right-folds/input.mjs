// A `||` / `??` the user wrote over a left that always yields - one this build serves, a global core-js
// extends in place (`Array`), a bare global name nothing writes - folds to that left in pure, the dead right
// and the import it named gone. A left the build does not serve keeps both operands live - a global core-js
// does not implement read off the realm, one the census sees written, an unknown one.
export const weak = globalThis.WeakMap || Map;
export const realm = globalThis || {};
export const made = new (Promise ?? WeakSet)(resolve => resolve());
export const unbacked = Array || Iterator;
export const fetcher = self.fetch || polyfillFetch;
export const patched = Symbol || (Symbol = shimSymbol);
export const maybe = pick() || Set;
export const absent = globalThis.WeakRef || DisposableStack;
