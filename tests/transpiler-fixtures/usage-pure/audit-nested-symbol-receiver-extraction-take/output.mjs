import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// a BOUND root is the user's own binding whatever its name - raw reads only
function take(self) {
  const shadowed = _getIteratorMethod(self.inner);
  return shadowed;
}
export { take };