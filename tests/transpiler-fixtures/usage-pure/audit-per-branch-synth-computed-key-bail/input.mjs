// per-branch synth-swap with a computed-key sibling: the computed property disqualifies
// pattern reshaping, so the bare `from` slot stays raw. plain identifiers in the
// conditional branches still receive the standard polyfill rewrite
function f({ [Symbol.iterator]: it, from } = cond ? Array : Iterator) {
  return [it, from];
}
export { f };
