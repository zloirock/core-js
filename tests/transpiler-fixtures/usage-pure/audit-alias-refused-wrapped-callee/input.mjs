// a this-PRESERVING wrapper between a guarded member and its call (`(M.groupBy as any)(...)`,
// `(P2.allSettled)(...)`, `(I.zip!)(...)`) keeps callee-ness: the raw branch binds `this` exactly like
// the bare form (babel only marks parens via node extra, oxc keeps a real node - the peel makes
// both classify alike). a SEQUENCE callee detaches `this` natively and must stay unbound
function viaCast(c) {
  let M: any;
  if (c) ({ Map: M } = globalThis);
  return (M.groupBy as any)([1, 2], x => x % 2);
}
function viaParen(c) {
  let P2;
  if (c) ({ Promise: P2 } = globalThis);
  return (P2.allSettled)([1, 2]);
}
function viaNonNull(c) {
  let I: any;
  if (c) ({ Iterator: I } = globalThis);
  return (I.zip!)([[1], [2]]);
}
function viaSeq(c) {
  let P;
  if (c) ({ Promise: P } = globalThis);
  return (0, P.try)(() => 1);
}
// a wrapped OPTIONAL callee refuses the guard machinery: no raw-branch bind is emitted, the member
// is left to the regular substitution path (pure bails when uncertain) and the optional call keeps
// caller-side `this`
function viaOptional(c) {
  let O;
  if (c) ({ Object: O } = globalThis);
  return (O.groupBy)?.([1, 2], x => x % 2);
}
// an instantiation-expression callee: the guard conditional needs explicit parens in the `expr<T>`
// slot - printed bare, the call re-parses into the alternate and the taken branch is never invoked
function viaInstantiation(c) {
  let P3;
  if (c) ({ Promise: P3 } = globalThis);
  return (P3.withResolvers<void>)();
}
// a wrapper STACK under the instantiation (`(expr as any)<T>`): the slot-filling cast needs the
// explicit parens too - printed bare, the type-argument list re-parses into a type
function viaCastInstantiation(c) {
  let P4;
  if (c) ({ Promise: P4 } = globalThis);
  return ((P4.any as any)<number>)([1, 2]);
}
export const r = [viaCast(true), viaParen(true), viaNonNull(true), viaSeq(true), viaOptional(true), viaInstantiation(true), viaCastInstantiation(true)];
