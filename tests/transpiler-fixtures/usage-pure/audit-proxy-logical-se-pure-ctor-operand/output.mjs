import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// A side-effect-prefixed pure-constructor proxy-global operand in a LOGICAL receiver: the leaf lookup
// must peel the SE tail to recognise the pure ctor, then leave the operand verbatim so the natural
// visitor whole-swaps its tail (`(effect(), globalThis.self.Map)` -> `(effect(), _Map)`), preserving
// the SE prefix. Rewriting it in place dropped the prefix / crashed the transform queue.
function effect() {
  return 0;
}
const groupBy = _Map$groupBy;
const {
  groupBy: _unused,
  ...rest
} = (effect(), _Map) || _Set;
groupBy([], item => item);