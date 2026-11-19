import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
var _ref;
// A transparent forwarder hands on the inner loop's returns as candidates: pure guards the
// static read after both calls on them, and global injects for the possible Map.
function inner() {
  while (flag) return _Map;
  return custom;
}
function outer() {
  return inner();
}
export const value = (_ref = outer(), _ref === _Map ? _Map$groupBy([1, 2, 3], value => value % 2) : _ref.groupBy([1, 2, 3], value => value % 2));