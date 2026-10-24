import _Map from "@core-js/pure/actual/map";
import _Object$isFrozen from "@core-js/pure/actual/object/is-frozen";
// An argument selected from an inline object still hands the contained container to the callee.
function consume(first) {
  if (first) first.k = _Map;
}
const escapedInsideObjectValue = function () {
  const objBox = {
    k: Object
  };
  consume({
    inner: objBox
  }.inner);
  const {
      k: _ref
    } = objBox,
    isFrozen = _ref === Object ? _Object$isFrozen : _ref.isFrozen;
  return isFrozen;
}();
export { escapedInsideObjectValue };