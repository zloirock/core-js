// for-of with a destructure pattern: the parent VariableDeclaration's declarator has no
// init (the init is supplied by the for-of iterator at runtime). the gate must handle the
// missing init. pattern is non-polyfillable here - just `{ x, y }` from iterator items -
// so the runner passes through without rewriting
const items = [{
  x: 1,
  y: 2
}];
let total = 0;
for (const {
  x,
  y
} of items) {
  total += x + y;
}
export { total };