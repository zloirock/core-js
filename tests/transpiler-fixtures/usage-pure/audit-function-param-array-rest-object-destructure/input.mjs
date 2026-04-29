// `function f([a, ...{at}])` - ArrayPattern with RestElement wrapping ObjectPattern.
// `isFunctionParamDestructureParent` walks the RestElement transparently (same as
// AssignmentPattern.left + ArrayPattern siblings), so the inner ObjectPattern is
// classified as function-param-destructure. without the walk, dispatch was skipped and
// the helper returned false for any ObjectPattern reached through a RestElement wrapper.
// regression smoke test: ensure the construct doesn't crash + classification path runs
export function f([first, ...{ at }]) {
  return at;
}
// nested RestElement wrapping deeper ObjectPattern - depth check exercises the walk loop
export function g([head, ...[, ...{ at }]]) {
  return [head, at];
}
