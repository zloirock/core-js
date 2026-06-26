import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A MULTI-HOP proxy-global receiver under an optional `?.`: `globalThis.self.window?.X`. the whole chain
// collapses to the always-defined pure root, so the `?.` is as dead as over a single hop (`globalThis.self?.X`)
// and must DEOPT - drop the null-guard, no `_ref` memo. before the fix only a single proxy hop deopted (the
// last-hop name `self` resolves a polyfill, but `window` / a deeper alias does not), so the multi-hop chain
// kept a guard memoizing a RAW `globalThis.self.window` (ie:11 ReferenceError). a non-alias last hop
// (`globalThis.self.foo?.x`) is NOT a proxy alias and KEEPS its guard - covered by the resolver tests, not
// here. distinct instance method per line; both proxy-alias orderings (self.window / window.self) and a
// triple hop.
const winLeaf = globalThis.self.window?.Array.prototype.flat.call([1, [2]]);
const selfLeaf = globalThis.window.self?.Array.prototype.includes.call([1], 1);
const deepHop = globalThis.self.window.self?.Array.prototype.at.call([3, 4], 0);
export { winLeaf, selfLeaf, deepHop };