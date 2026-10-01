// a binding whose ctor-alias write is followed by a USER reassignment: the alias hint is
// refused (last write wins), and the TYPE flow follows the reassignment instead - both
// emitters narrow the member to the reassigned value's variant. babel used to lose the
// binding from its scope registry after the alias rewrite and degraded to generic while
// the estree side narrowed - the recovery rebuilds the binding from the AST. a function
// scope redeclaring the name keeps its own shadow binding untouched
let M;
({ Map: M } = globalThis);
M = [5, 6];
export const r1 = M.at(0);
let P;
({ Promise: P } = globalThis);
P = 'ts';
export const r2 = P.includes('t');
let Q;
({ Map: Q } = globalThis);
Q = [[7], 8];
function inner() {
  const Q = 'str';
  return typeof Q.at;
}
export const r3 = [Q.flat().length, inner()];
