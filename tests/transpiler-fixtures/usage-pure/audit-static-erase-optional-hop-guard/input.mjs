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
const ag = globalThis;
export const single = globalThis.window?.self.Array.of(1);
export const multi = globalThis?.window?.Set;
export const chained = (cw = globalThis.window)?.self.Array.from([1]);
export const erasable = globalThis.self?.Map;
export const fallback = globalThis.window?.self.Promise.noSuchStatic;
export const aliasGuard = ag.window?.self.Array.of(2);
