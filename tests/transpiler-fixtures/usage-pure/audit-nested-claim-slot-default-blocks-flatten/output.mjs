import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a DEFAULT between the leaf and the host decides what is destructured at all, so a route that
// rewrites the shape must CARRY it rather than step over it: the twin's receiver is the fold of both
// arms - the slot's own value when it is defined, the call that produces the fallback only when it
// is not - read once, which is what lets the claim leave without losing either
const box = {
  y: [1, [2]]
};
function raise() {
  return [3];
}
const defaultedSlot = function () {
  var _ref;
  const _ref2 = (_ref = box.y) === void 0 ? raise() : _ref;
  const at = _atMaybeArray(_ref2);
  const {
    other
  } = _ref2;
  return [at, other];
}();
export { defaultedSlot };