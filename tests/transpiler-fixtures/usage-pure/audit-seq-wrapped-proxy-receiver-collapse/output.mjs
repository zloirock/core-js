import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A proxy-global receiver wrapped in a side-effecting SequenceExpression: `(eff(), globalThis.self)`. the
// redundant `.self` proxy hop collapses to the pure root and the prefix effect harvests ahead of it, both in a
// plain receiver `(eff(), globalThis.self).Array.prototype...` and in an OPTIONAL one `(eff(), globalThis.self)?.
// Array.prototype...` whose receiver memoizes into a `_ref` guard - the guard body must collapse too (`_ref =
// (eff(), _globalThis)`). babel keeps the receiver raw (`(eff(), globalThis.self)` / `_ref = (eff(), globalThis
// .self)`) - a bare `globalThis` that ie:11-ReferenceErrors and a dead `.self` - so output-unplugin.mjs diverges
// (unplugin matches its own collapse of the bare `globalThis.self` receiver). identifier-tail and `.window` hop
// cover the root variants; distinct instance method per line.
let log = [];
function eff(tag) {
  _pushMaybeArray(log).call(log, tag);
}
const nonOpt = _flatMaybeArray((eff('a'), _globalThis).Array.prototype).call([1, [2]]);
const optInst = _includesMaybeArray((eff('b'), _globalThis).Array.prototype).call([1], 1);
const optId = _atMaybeArray((eff('c'), _globalThis).Array.prototype).call([3, 4], 0);
const optWin = _flatMapMaybeArray((eff('d'), _globalThis).Array.prototype).call([1], x => [x]);
export { nonOpt, optInst, optId, optWin, log };