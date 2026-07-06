import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// a this-PRESERVING wrapper between a guarded member and its call (`(M.groupBy as any)(...)`,
// `(P2.allSettled)(...)`, `(I.zip!)(...)`) keeps callee-ness: the raw branch binds `this` exactly like
// the bare form (babel only marks parens via node extra, oxc keeps a real node - the peel makes
// both classify alike). a SEQUENCE callee detaches `this` natively and must stay unbound
function viaCast(c) {
  let M: any;
  if (c) M = _Map;
  return ((M === _Map ? _Map$groupBy : M.groupBy.bind(M)) as any)([1, 2], x => x % 2);
}
function viaParen(c) {
  let P2;
  if (c) P2 = _Promise;
  return (P2 === _Promise ? _Promise$allSettled : P2.allSettled.bind(P2))([1, 2]);
}
function viaNonNull(c) {
  let I: any;
  if (c) I = _Iterator;
  return (I === _Iterator ? _Iterator$zip : I.zip.bind(I))!([[1], [2]]);
}
function viaSeq(c) {
  let P;
  if (c) P = _Promise;
  return (0, P === _Promise ? _Promise$try : P.try)(() => 1);
}
// a wrapped OPTIONAL callee refuses the guard machinery: no raw-branch bind is emitted, the member
// is left to the regular substitution path (pure bails when uncertain) and the optional call keeps
// caller-side `this`
function viaOptional(c) {
  let O;
  if (c) ({
    Object: O
  } = _globalThis);
  return O.groupBy?.([1, 2], x => x % 2);
}
// an instantiation-expression callee: the guard conditional needs explicit parens in the `expr<T>`
// slot - printed bare, the call re-parses into the alternate and the taken branch is never invoked
function viaInstantiation(c) {
  let P3;
  if (c) P3 = _Promise;
  return (P3 === _Promise ? _Promise$withResolvers : P3.withResolvers.bind(P3))<void>();
}
// a wrapper STACK under the instantiation (`(expr as any)<T>`): the slot-filling cast needs the
// explicit parens too - printed bare, the type-argument list re-parses into a type
function viaCastInstantiation(c) {
  let P4;
  if (c) P4 = _Promise;
  return ((P4 === _Promise ? _Promise$any : P4.any.bind(P4)) as any)<number>([1, 2]);
}
export const r = [viaCast(true), viaParen(true), viaNonNull(true), viaSeq(true), viaOptional(true), viaInstantiation(true), viaCastInstantiation(true)];