// `({ x: f } = { x: {...} })` ObjectPattern destructure-assignment narrows `f` to the
// matching RHS slot. Path resolution now follows the destructure LHS by matching the
// destructured key against the RHS key-path walk. ESTree preserves a
// ParenthesizedExpression wrapper around the AssignmentExpression - the preceding-block
// assignment lookup unwraps it
function take(init: { data: string[] | number }) {
  let f = init;
  ({ x: f } = { x: { data: ['y'] } });
  return f.data.at(0);
}
export { take };
