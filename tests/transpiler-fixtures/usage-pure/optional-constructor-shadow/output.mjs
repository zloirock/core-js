import _at from "@core-js/pure/actual/instance/at";
// A local constructor-shaped value retains its own optional method and receiver.
function read(Array) {
  var _ref, _ref2;
  let held;
  return null == (held = Array, _ref = held.from) ? void 0 : _at(_ref2 = _ref.call(held, [1, 2])).call(_ref2, -1);
}
export const result = read({});