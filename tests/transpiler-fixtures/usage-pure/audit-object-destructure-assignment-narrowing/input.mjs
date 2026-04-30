// `({ x: f } = { x: {...} })` ObjectPattern destructure-assignment narrows `f` to the
// matching RHS slot. resolvePath now follows destructure LHS via findDestructuredKeyPath
// + RHS key-path walk. ESTree preserves ParenthesizedExpression wrapper around the
// AssignmentExpression - findPrecedingBlockAssignment unwraps it
function take(init: { data: string[] | number }) {
  let f = init;
  ({ x: f } = { x: { data: ['y'] } });
  return f.data.at(0);
}
export { take };
