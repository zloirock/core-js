import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
// AssignmentPattern wraps an ArrayPattern at the LHS of a function param: the inner
// destructure is itself an array pattern, the receiver default is `Array`. Static
// classification rules lock per-key dispatch on the inner array slot when defined,
// distinct prototype methods on subsequent receivers narrow expectations
function takeArr([first = 0] = []) {
  var _ref;
  return _atMaybeArray(_ref = [first]).call(_ref, 0);
}
function rotateMap({
  size,
  has,
  get
} = new _Map()) {
  return [size, has(1), get(2)];
}
export { takeArr, rotateMap };