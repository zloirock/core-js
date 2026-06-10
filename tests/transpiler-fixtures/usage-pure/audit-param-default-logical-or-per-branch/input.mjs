// param destructure default with logical `Array || Iterator`: detection resolves the meta
// through the LEFT branch (fallback wrappers peel deterministically), so the synth replaces
// the WHOLE expression with the literal - the same left-collapse the declarator flatten
// applies, caller-correct in the default slot
function f({ from } = Array || Iterator) {
  return from([1]);
}
export { f };
