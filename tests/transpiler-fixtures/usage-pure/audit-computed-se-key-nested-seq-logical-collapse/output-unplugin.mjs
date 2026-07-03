import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// A destructure receiver that roots in a nested sequence AND carries a SIDE-EFFECTING computed proxy hop
// (`(c++, (d++, globalThis))[(e++, 'self')].Array.prototype`) must collapse the whole navigation: drop the
// `[...]` hop, harvest its key effect in source order, and rewrite the bare root to the pure global. the
// logical-operand collapse gate bailed on the SE-bearing key, leaving a BARE `globalThis` (ie:11
// ReferenceError) under the `|| {}`; the instance source gate already admitted SE keys, so the two paths
// diverged. SEPARATELY the receiver-TYPE inference must resolve THROUGH the SE-bearing computed key + nested
// sequence so a multi-type method narrows to its array variant. multi-type methods (includes, at) sit on a
// bare declarator / assignment where the receiver is a single concrete Array.prototype - they prove the
// inference (array variant only). the logical hosts carry ARRAY-ONLY methods (flat, findLast):
// an always-truthy left decides a logical statically - `||` narrows to the LEFT (the collapse still fires
// there), `&&` narrows to the RIGHT `{}`, so that line has nothing to polyfill and stays a passthrough
// (root swap only, hop key effect in place). each line binds a DISTINCT method; counters prove key SE order.
let a = 0, b = 0, c = 0, d = 0, e = 0, x;
const flat = _flatMaybeArray((c++, d++, e++, _globalThis).Array.prototype || {});
const { findLast } = (c++, _globalThis)[(e++, 'self')].Array.prototype && {};
const includes = _includesMaybeArray((a++, b++, c++, _globalThis).Array.prototype);
x = _atMaybeArray((c++, e++, _globalThis).Array.prototype);
export { flat, findLast, includes, x, a, b, c, d, e };