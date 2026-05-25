import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// body-extract for the renamed-alias shape `{from: alias}` (no default) with a rest
// sibling. prop binding-identifier resolver surfaces the AssignmentPattern.left or the renamed
// identifier directly. body emits `let alias = _polyfill;` preserving the user's chosen
// local name. distinct keys (`from` / `of`) on separate functions verify per-key dispatch
function run({
  from: _unused,
  ...rest
} = Array) {
  let arr = _Array$from;
  return [arr([1]), rest];
}
function emit({
  of: _unused2,
  ...rest
} = Array) {
  let arrOf = _Array$of;
  return [arrOf(2, 3), rest];
}
export { run, emit };