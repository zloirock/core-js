import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// An OPTIONAL chain on a computed proxy-global hop with a side-effecting key: `globalThis[(eff(), 'self')]?.X`.
// the proxy root collapses to the always-defined pure global, so the `?.` is SUBSUMED (provably non-nullish)
// and the hop SE folds ONCE into the collapsed receiver `(eff('a'), _globalThis).Array.prototype` - no `_ref`
// guard, no risk of running the effect twice. multi-type methods (at, includes) on the explicit Array.prototype
// narrow to the array variant through the subsumed optional + folded SE (an array-only method would resolve
// regardless and prove nothing). babel and unplugin converge - no sidecar. distinct method per line; the log
// proves each key effect runs exactly once.
let log = [];
function eff(tag) {
  _pushMaybeArray(log).call(log, tag);
  return tag;
}
const atRes = _atMaybeArray((eff('a'), _globalThis).Array.prototype).call([1, [2]], 0);
const incRes = _includesMaybeArray((eff('b'), _globalThis).Array.prototype).call([1], 1);
export { atRes, incRes, log };