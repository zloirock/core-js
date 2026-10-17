import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// an instantiation-expression callee: the guard conditional needs explicit parens in the `expr<T>`
// slot - printed bare, the call re-parses into the alternate and the taken branch is never invoked
export function viaInstantiation(c) {
  let P3;
  if (c) P3 = _Promise;
  return (P3 === _Promise ? _Promise$withResolvers : P3.withResolvers.bind(P3))<void>();
}
export const r = [viaInstantiation(true)];