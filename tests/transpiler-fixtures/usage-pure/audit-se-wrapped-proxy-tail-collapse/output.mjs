import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A proxy-global receiver carried as the TAIL of a side-effecting SequenceExpression, on instance-method and
// destructure sources: `(eff(), globalThis.self).Array.prototype.flat`. babel and unplugin BOTH collapse the
// proxy hop to the pure root and harvest the prefix effect ahead of it (`(eff(), _globalThis).Array.prototype`)
// - no raw `.self` that reads undefined off-engine (ie:11 / Node). covers the SE-wrapped TAIL, the SE-PREFIX
// root (`(eff(), globalThis).self.X`), a destructure source, and a DOUBLE hop. distinct instance method per line.
let log = [];
function eff(tag) {
  _pushMaybeArray(log).call(log, tag);
  return tag;
}
const callInst = _flatMaybeArray((eff('a'), _globalThis).Array.prototype).call([1, [2]]);
const prefixRoot = _includesMaybeArray((eff('b'), _globalThis).Array.prototype).call([1], 1);
const flatMap = _flatMapMaybeArray((eff('c'), _globalThis).Array.prototype);
const doubleHop = _atMaybeArray((eff('d'), _globalThis).Array.prototype).call([5, 6], 0);
export { callInst, prefixRoot, flatMap, doubleHop, log };