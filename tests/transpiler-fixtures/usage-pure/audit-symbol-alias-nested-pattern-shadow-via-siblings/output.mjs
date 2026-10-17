import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// same-named aliases in SIBLING closures are separate bindings: EACH scope's consumer folds
// off its own registration record (a flat first-write-wins registry served only the first
// closure and lost every later fold on the target engine - read AND call shapes both fold)
const iterator = _Symbol$iterator;
function siblingA() {
  const iterator = _Symbol$iterator;
  return typeof _getIteratorMethod([]);
}
function siblingB() {
  const iterator = _Symbol$iterator;
  return _getIterator([3, 4]).next().value;
}
export const viaSiblings = [siblingA(), siblingB()];