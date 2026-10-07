// In usage-global the selections stay as written: the right of a left that always yields injects nothing -
// one this build serves, a global core-js extends in place (`Array`), a bare global name nothing writes -
// while a left it does not serve - a global core-js does not implement read off the realm, an unknown one -
// keeps its right live and injected, and so does one the census sees written (`Symbol`).
export const weak = globalThis.WeakMap || Map;
export const realm = globalThis || {};
export const made = new (Promise ?? WeakSet)(resolve => resolve());
export const unbacked = Array || Iterator;
export const fetcher = self.fetch || polyfillFetch;
export const patched = Symbol || (Symbol = shimSymbol);
export const maybe = pick() || Set;
export const absent = globalThis.WeakRef || DisposableStack;
