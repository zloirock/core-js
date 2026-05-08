import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// per-branch synth-swap with a computed-key sibling: the computed property disqualifies
// pattern reshaping, so the bare `from` slot stays raw. plain identifiers in the
// conditional branches still receive the standard polyfill rewrite
function f({
  [_Symbol$iterator]: it,
  from
} = cond ? Array : _Iterator) {
  return [it, from];
}
export { f };