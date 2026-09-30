import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _Object$seal from "@core-js/pure/actual/object/seal";
// A folded slice key does not invalidate the array element read by the nested pattern.
const foldedReadOnlyKeyStillResolves = function () {
  const foldedBox = [Object];
  // eslint-disable-next-line no-useless-concat -- the folded spelling is the shape under test
  _sliceMaybeArray(foldedBox).call(foldedBox, 0);
  const seal = _Object$seal;
  return seal;
}();
export { foldedReadOnlyKeyStillResolves };