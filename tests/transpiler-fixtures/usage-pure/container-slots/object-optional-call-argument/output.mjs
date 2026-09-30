import _Map from "@core-js/pure/actual/map";
import _Object$isSealed from "@core-js/pure/actual/object/is-sealed";
// An optional call can hand the container to a callee that writes its constructor slot.
function consume(first) {
  if (first) first.k = _Map;
}
const escapedByOptionalCall = function () {
  const optionalBox = {
    k: Object
  };
  consume?.(optionalBox);
  const {
      k: _ref
    } = optionalBox,
    isSealed = _ref === Object ? _Object$isSealed : _ref.isSealed;
  return isSealed;
}();
export { escapedByOptionalCall };