import _Map from "@core-js/pure/actual/map";
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
    k: {
      getOwnPropertyDescriptor
    }
  } = applyBox;
  return getOwnPropertyDescriptor;
}();
export { escapedViaApplyArray };