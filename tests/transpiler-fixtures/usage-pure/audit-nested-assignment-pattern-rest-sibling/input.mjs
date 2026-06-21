// nested destructure with AssignmentPattern default + rest sibling. the inner default
// `{from = []}` itself has a default, so body-extract must traverse the nested
// AssignmentPattern.left, detect the polyfilled key on the inner ObjectPattern, and
// preserve the outer rest exclusion. distinct keys (`from` / `of`) verify per-key dispatch
function run({ x: { from = [] } = Array, ...rest } = {}) {
  return [from([1]), rest];
}
function emit({ y: { of = () => null } = Array, ...rest } = {}) {
  return [of(2, 3), rest];
}
export { run, emit };
