import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// a static-method substitution ERASES its receiver navigation - the navigation only names the global
// the substituted import already is. but a live `?.` guarding a value that navigates an unponyfilled
// proxy hop (`globalThis.window`) is NOT erasable: dropping it runs the static where the source
// short-circuits. the claim re-hangs inside the guard, and the test binds the OBJECT of the specific
// `?.` that guards the undefinable value - NOT the descended root. a MID-CHAIN `?.` and a MULTI-hop
// chain (where an outer `?.` guards the always-defined root) both guard `globalThis.window`, a hop the
// root does not cover; a chain-assign root rides the test verbatim; a `?.` over a self-ref hop
// (`globalThis.self`, always defined) stays fully erasable.
// the static-FALLBACK swap (member not polyfilled, only the receiver swaps to the pure ctor) needs
// the same guard - the swap alone eats the `?.` short-circuit.
// the guard object may be rooted at an ALIAS of the proxy global (`const g = globalThis; g.window`): the
// alias is already the pure binding through its own declaration, so its root rides the test verbatim (`null
// == g.window`), NOT resolved off a literal name - getting this wrong leaves the whole claim raw (no polyfill).
let cw;
const ag = _globalThis;
export const single = null == _globalThis.window ? void 0 : _Array$of(1);
export const multi = null == _globalThis.window ? void 0 : _Set;
export const chained = null == (cw = _globalThis.window) ? void 0 : _Array$from([1]);
export const erasable = _Map;
export const fallback = null == _globalThis.window ? void 0 : _Promise.noSuchStatic;
export const aliasGuard = null == ag.window ? void 0 : _Array$of(2);