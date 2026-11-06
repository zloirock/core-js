import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// a sibling binding keeps the PATTERN alive, but not the hop: the leaf leaves and the emptied
// hop prunes with it, so the sibling reads its own key and nothing reads `inner` twice
const kept = _getIteratorMethod(obj.inner);
const {
  keep
} = obj;
export { kept };
export { keep };