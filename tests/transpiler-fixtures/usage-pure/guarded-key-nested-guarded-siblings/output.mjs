import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// The guarded receiver retains deletion and all live key or sibling claims.
export function read(choice) {
  const effects = [];
  let C = _Map;
  if (choice) C = _Set;
  const {} = (_pushMaybeArray(effects).call(effects, 1), _pushMaybeArray(effects).call(effects, 2), C),
    groupBy = C === _Map ? _Map$groupBy : C.groupBy,
    name = _nameMaybeFunction(C);
  return [typeof groupBy, typeof name];
}