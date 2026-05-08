import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// per-branch synth with a computed-key sibling in the pattern. `isSynthSimpleObjectPattern`
// rejects computed properties, so per-branch synth bails for the whole pattern; the bare
// `from` slot stays raw. The conditional branches still receive the standard global
// identifier rewrite (`Array` -> `_Array`, `Iterator` -> `_Iterator`)
function f({
  [_Symbol$iterator]: it,
  from
} = cond ? Array : _Iterator) {
  return [it, from];
}
export { f };