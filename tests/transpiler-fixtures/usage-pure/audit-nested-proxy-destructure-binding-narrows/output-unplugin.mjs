import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// nested proxy-global destructure lock: `const {window: {Array}} = globalThis` exits to
// the same Array global as the flat form via `globalThis.window === globalThis` on
// browsers. before the fix, resolveProxyGlobalDestructureAlias only iterated top-level
// pattern properties and bailed on the inner ObjectPattern (`patternBindingName` on a
// non-Identifier value returns null), so `Array` stayed an opaque local binding without
// a global hint - `Array.from(...)` lost the narrow. after the fix, the walker recurses
// through proxy-global keys (`window`, `self`, ...) and resolves the leaf binding's key
const { window: { Array } } = _globalThis;
const arr = _Array$from([1, 2, 3]);
const head = _at(arr).call(arr, 0);
export { head };