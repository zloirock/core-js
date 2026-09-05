// a BOUND branch name is the value canon's question, not a bail: a const alias of a global resolves to
// it and mirrors per branch like the bare name, so the pattern never reads the static off the swapped
// constructor (which carries none); a parameter shadowing the name resolves to no global and its
// branch stays raw
const P = Promise;
const { all: viaAlias } = cond ? P : Fallback;
const A = Array;
const { from: viaLogical } = A || Iterator;
function shadowed(Array) {
  const { from } = cond ? Array : Iterator;
  return from;
}
export { viaAlias, viaLogical, shadowed };
