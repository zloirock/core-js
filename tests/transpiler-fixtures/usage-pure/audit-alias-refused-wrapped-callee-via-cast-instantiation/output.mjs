import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a wrapper STACK under the instantiation (`(expr as any)<T>`): the slot-filling cast needs the
// explicit parens too - printed bare, the type-argument list re-parses into a type
export function viaCastInstantiation(c) {
  let P4;
  if (c) P4 = _Promise;
  return ((P4 === _Promise ? _Promise$any : P4.any.bind(P4)) as any)<number>([1, 2]);
}
export const r = [viaCastInstantiation(true)];