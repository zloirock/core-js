// an instantiation-expression callee: the guard conditional needs explicit parens in the `expr<T>`
// slot - printed bare, the call re-parses into the alternate and the taken branch is never invoked
export function viaInstantiation(c) {
  let P3;
  if (c) ({ Promise: P3 } = globalThis);
  // @ts-expect-error an instantiation over a value with no generic signature is the shape under test
  return (P3.withResolvers<void>)();
}
export const r = [viaInstantiation(true)];
