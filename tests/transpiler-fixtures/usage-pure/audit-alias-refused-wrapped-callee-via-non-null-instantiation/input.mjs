// the same stack with a NON-NULL filling the slot: `!` already binds tighter than the type-argument
// list, so this one takes the guard bare - the restoration owes parens to the slot's priority, not
// to every wrapper it finds there
export function viaNonNullInstantiation(c) {
  let P5;
  if (c) ({ Promise: P5 } = globalThis);
  return ((P5.race!)<number>)([]);
}
export const r = [viaNonNullInstantiation(true)];
