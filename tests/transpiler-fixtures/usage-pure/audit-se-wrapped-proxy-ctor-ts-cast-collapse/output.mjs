import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// A SE-wrapped proxy-global ctor sub-receiver carrying a transparent TS wrapper (`((c++, globalThis.self).Map
// as any).prototype.has` / a non-null `!`): the runtime-no-op wrapper is peeled to reach the buried SE-sequence,
// so the prototype fallback still swaps the ctor to the pure binding and re-emits the call effect. Distinct
// ctors / wrapper positions per line: cast on the ctor sub-receiver, cast inside the sequence tail, a non-null
// assertion on the tail, and (last) a cast on the WHOLE `.prototype` receiver - the resolver + both emitters
// peel it to find the ctor, swapping it while KEEPING the cast on `.prototype` (`(eff(), _Promise).prototype`).
let log = [];
function eff(tag) {
  _pushMaybeArray(log).call(log, tag);
  return tag;
}
const castCtor = (eff('a'), _Map).prototype.has.call(new _Map(), 1);
const castTail = (eff('b'), _Set).prototype.add.call(new _Set(), 2);
const nonNull = (eff('c'), _WeakMap).prototype.get.call(new _WeakMap(), {});
const castProto = ((eff('d'), _Promise).prototype as any).then;
export { castCtor, castTail, nonNull, castProto, log };