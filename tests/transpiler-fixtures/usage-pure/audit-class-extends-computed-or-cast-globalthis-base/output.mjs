import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// `extends globalThis['Array']` (computed key) and `extends (globalThis as any).Array`
// (TS-cast) both resolve to the global Array: super-global resolution must peel TS wrappers,
// accept computed string-literal keys, and map the alias `_globalThis` back to `'globalThis'`,
// else `c.at(0)` / `d.includes('x')` lose the Array-subclass narrow (parity with `extends Array`)
class Computed extends _globalThis['Array']<string[]> {}
class Cast extends _globalThis.Array<string[]> {}
const c = new Computed();
const d = new Cast();
_atMaybeArray(c).call(c, 0);
_includesMaybeArray(d).call(d, 'x');