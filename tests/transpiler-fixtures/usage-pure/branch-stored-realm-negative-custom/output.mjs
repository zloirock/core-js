import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A stored realm in one arm does not turn the other arm into a realm.
// Provide Map for the realm while retaining the custom constructor and the store.
export function read(Custom, flag) {
  var _ref;
  const custom = {
    Map: Custom
  };
  let held;
  return _ref = flag ? held = _globalThis : custom, _ref === _globalThis ? _Map : _ref.Map;
}