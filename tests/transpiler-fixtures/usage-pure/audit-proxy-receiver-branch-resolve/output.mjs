import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _self from "@core-js/pure/actual/self";
// A proxy-global in a ternary / logical BRANCH (`(c ? globalThis.self : {}).X`, `(x || globalThis.self).X`):
// the consuming member sits on the BRANCH, not on the proxy, so the `.self` hop cannot be dropped - instead
// the branch value resolves to the proxy-global's pure import (`globalThis.self` -> `_self`), never a raw
// read (undefined off-engine / ie:11 ReferenceError). a branch receiver is a UNION, on which a multi-type
// method would over-inject the other variant, so array-only methods isolate the resolve. distinct method.
let c = 1,
  x = null;
const ternary = _flatMaybeArray((c ? _self : {}).Array.prototype).call([1, [2]]);
const logicalOr = _findLastMaybeArray((x || _self).Array.prototype).call([1, 2], v => v > 1);
export { ternary, logicalOr };