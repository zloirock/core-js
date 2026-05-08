import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `({ x: f } = { x: {...} })` ObjectPattern destructure-assignment narrows `f` to the
// matching RHS slot. resolvePath now follows destructure LHS via findDestructuredKeyPath
// + RHS key-path walk. ESTree preserves ParenthesizedExpression wrapper around the
// AssignmentExpression - findPrecedingBlockAssignment unwraps it
function take(init: { data: string[] | number }) {
  var _ref;
  let f = init;
  ({ x: f } = { x: { data: ['y'] } });
  return _atMaybeArray(_ref = f.data).call(_ref, 0);
}
export { take };