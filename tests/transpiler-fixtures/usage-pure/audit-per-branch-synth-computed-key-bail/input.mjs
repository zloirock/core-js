// per-branch synth with a computed-key sibling in the pattern. `isSynthSimpleObjectPattern`
// rejects computed properties, so per-branch synth bails for the whole pattern; the bare
// `from` slot stays raw. The conditional branches still receive the standard global
// identifier rewrite (`Array` -> `_Array`, `Iterator` -> `_Iterator`)
function f({ [Symbol.iterator]: it, from } = cond ? Array : Iterator) {
  return [it, from];
}
export { f };
