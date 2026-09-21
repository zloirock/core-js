import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// An unknown key selects an Object constructor; reading groupBy does not expose its namespace.
export function read(key) {
  var _ref;
  return _ref = [Object][key], _ref === Object ? _Object$groupBy([1, 2], value => value % 2) : _ref.groupBy([1, 2], value => value % 2);
}