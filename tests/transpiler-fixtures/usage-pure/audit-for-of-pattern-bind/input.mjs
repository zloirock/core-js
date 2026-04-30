// for-of with destructure pattern. asserts the `canTransformDestructuring` gate handles
// the parent VariableDeclaration whose declarator has no init (init is provided by the
// for-of iterator at runtime). pattern is non-polyfillable here - just `{ x, y }` from
// iterator items - and runner should pass through without rewriting
const items = [{ x: 1, y: 2 }];
let total = 0;
for (const { x, y } of items) {
  total += x + y;
}
export { total };
