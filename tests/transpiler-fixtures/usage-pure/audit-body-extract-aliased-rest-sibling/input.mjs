// body-extract for the renamed-alias shape `{from: alias}` (no default) with a rest
// sibling. prop binding-identifier resolver surfaces the AssignmentPattern.left or the renamed
// identifier directly. body emits `let alias = _polyfill;` preserving the user's chosen
// local name. distinct keys (`from` / `of`) on separate functions verify per-key dispatch
function run({ from: arr, ...rest } = Array) {
  return [arr([1]), rest];
}
function emit({ of: arrOf, ...rest } = Array) {
  return [arrOf(2, 3), rest];
}
export { run, emit };
