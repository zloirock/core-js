// a wrapper STACK under the instantiation (`(expr as any)<T>`): the slot-filling cast needs the
// explicit parens too - printed bare, the type-argument list re-parses into a type
export function viaCastInstantiation(c) {
  let P4;
  if (c) ({ Promise: P4 } = globalThis);
  // @ts-expect-error an instantiation over a value with no generic signature is the shape under test
  return ((P4.any as any)<number>)([1, 2]);
}
export const r = [viaCastInstantiation(true)];
