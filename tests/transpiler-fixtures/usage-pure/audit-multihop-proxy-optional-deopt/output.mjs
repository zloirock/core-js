import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// A MULTI-HOP proxy-global receiver under an optional `?.`: `globalThis.self.window?.X`. the whole chain
// collapses to the always-defined pure root, so the `?.` is as dead as over a single hop (`globalThis.self?.X`)
// and must DEOPT - drop the null-guard, no `_ref` memo. before the fix only a single proxy hop deopted (the
// last-hop name `self` resolves a polyfill, but `window` / a deeper alias does not), so the multi-hop chain
// kept a guard memoizing a RAW `globalThis.self.window` (ie:11 ReferenceError). a non-alias last hop
// (`globalThis.self.foo?.x`) is NOT a proxy alias and KEEPS its guard - covered by the resolver tests, not
// here. distinct instance method per line; both proxy-alias orderings (self.window / window.self) and a
// triple hop.
const winLeaf = _flatMaybeArray(_globalThis.Array.prototype).call([1, [2]]);
const selfLeaf = _includesMaybeArray(_globalThis.Array.prototype).call([1], 1);
const deepHop = _atMaybeArray(_globalThis.Array.prototype).call([3, 4], 0);
export { winLeaf, selfLeaf, deepHop };