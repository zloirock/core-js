import _Map from "@core-js/pure/actual/map";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
// An apply argument array hands its contained object to the callee before the nested read.
function consume(first) {
  if (first) first.k = _Map;
}
const escapedViaApplyArray = function () {
  const applyBox = {
    k: Object
  };
  consume.apply(null, [applyBox]);
  const {
      k: _ref
    } = applyBox,
    getOwnPropertyDescriptor = _ref === Object ? _Object$getOwnPropertyDescriptor : _ref.getOwnPropertyDescriptor;
  return getOwnPropertyDescriptor;
}();
export { escapedViaApplyArray };