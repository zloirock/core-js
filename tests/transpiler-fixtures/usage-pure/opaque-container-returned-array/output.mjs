import _Array$from from "@core-js/pure/actual/array/from";
// A yielded constructor selected by an unknown key needs only the named static in global.
// Pure guards Array, which has no whole-value ponyfill, before reading that static.
function box(value) {
  return [value];
}
export function read(key) {
  var _ref;
  return _ref = box(Array)[key], _ref === Array ? _Array$from([1, 2]) : _ref.from([1, 2]);
}