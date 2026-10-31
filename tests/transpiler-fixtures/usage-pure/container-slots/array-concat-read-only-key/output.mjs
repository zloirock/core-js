import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const foldedReadOnlyKeyStillResolves = function () {
  const foldedBox = [Object];
  // eslint-disable-next-line no-useless-concat -- the folded spelling is the shape under test
  _sliceMaybeArray(foldedBox).call(foldedBox, 0);
  const {
    0: {
      seal
    }
  } = foldedBox;
  return seal;
}();
export { foldedReadOnlyKeyStillResolves };