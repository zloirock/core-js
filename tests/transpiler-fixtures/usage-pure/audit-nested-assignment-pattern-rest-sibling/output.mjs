import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// nested destructure with AssignmentPattern default + rest sibling. outer pattern
// `{x = {...}, ...outer}` carries a rest, and the inner default `{from = []}` itself
// has a default value. body-extract must traverse the nested AssignmentPattern.left
// and detect the polyfilled key on the inner ObjectPattern, emitting body-extract
// for the inner `from` while preserving the outer rest exclusion via `_unused`.
// distinct keys (`from` / `of`) verify per-key dispatch through nested patterns
function run({
  x: {
    from = []
  } = {
    from: _Array$from
  },
  ...rest
} = {}) {
  return [from([1]), rest];
}
function emit({
  y: {
    of = () => null
  } = {
    of: _Array$of
  },
  ...rest
} = {}) {
  return [of(2, 3), rest];
}
export { run, emit };