// same-named aliases in SIBLING closures are separate bindings: EACH scope's consumer folds
// off its own registration record (a flat first-write-wins registry served only the first
// closure and lost every later fold on the target engine - read AND call shapes both fold)
const { iterator } = Symbol;
function siblingA() {
  const { iterator } = Symbol;
  return typeof [][iterator];
}
function siblingB() {
  const { iterator } = Symbol;
  return [3, 4][iterator]().next().value;
}
export const viaSiblings = [siblingA(), siblingB()];
