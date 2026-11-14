import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  let C = _Map;
  if (choice) C = _Set;
  return typeof (_pushMaybeArray(effects).call(effects, 1), _pushMaybeArray(effects).call(effects, 2), C === _Map ? _Map$groupBy : C.groupBy);
}