import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A constructor WITHOUT a pure entry (`Array`) read off a GUARDED realm alias and HELD in a local:
// the held alias reads through the same member chain the direct read does, so its root's own writes
// name the candidates and the static dispatches through the captured-receiver narrow
// (`_ref === Array ? _Array$of(7) : _ref.of(7)`) instead of staying a raw read the floor lacks -
// direct, sequence-prefixed and held spellings alike. A constructor WITH a pure entry (`Map`) keeps
// the family entry the census already gave it.
let count = 0;
const eff = () => count++;
function read(flag) {
  var _ref;
  if (flag) {
    var realm = _globalThis;
  }
  const direct = (_ref = realm.Array, _ref === Array ? _Array$of(7) : _ref.of(7));
  const held = realm.Array;
  const viaHeld = (held, held === Array ? _Array$of(7) : held.of(7));
  const heldPure = (0, realm).Array;
  const viaHeldPure = (heldPure, heldPure === Array ? _Array$of(7) : heldPure.of(7));
  const heldEffect = (eff(), realm).Array;
  const viaHeldEffect = (heldEffect, heldEffect === Array ? _Array$of(7) : heldEffect.of(7));
  const heldMap = realm === _globalThis ? _Map : realm.Map;
  const viaMap = typeof heldMap.groupBy;
  return [direct, viaHeld, viaHeldPure, viaHeldEffect, viaMap];
}
export { read, count };