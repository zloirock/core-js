import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A returned local name never proves the same-spelled global in the caller scope.
// Local constructor shadows retain their native prototype reads.
const v = _values((() => {
  const Map = _WeakMap;
  return Map;
})().prototype);
const k = _keys((() => {
  const Set = _WeakSet;
  return Set;
})().prototype);
const e = _entries((() => {
  const Array = String;
  return Array;
})().prototype);
export { v, k, e };