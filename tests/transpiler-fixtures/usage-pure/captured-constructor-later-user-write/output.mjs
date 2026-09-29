import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A later user write replaces the constructor introduced by the captured assignment.
// The capture still returns its original realm and evaluates each effect once.
const log = [];
function read() {
  var _ref;
  let C;
  const realm = (_ref = (_pushMaybeArray(log).call(log, 'rhs'), _globalThis), _pushMaybeArray(log).call(log, 'key'), C = _Map, _ref);
  C = {
    groupBy: 9
  };
  return [realm === _globalThis, C === _Map ? _Map$groupBy : C.groupBy];
}
export const result = read();
export const effects = log;