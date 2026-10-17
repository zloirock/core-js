import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
// the same stack with a NON-NULL filling the slot: `!` already binds tighter than the type-argument
// list, so this one takes the guard bare - the restoration owes parens to the slot's priority, not
// to every wrapper it finds there
export function viaNonNullInstantiation(c) {
  let P5;
  if (c) P5 = _Promise;
  return (P5 === _Promise ? _Promise$race : P5.race.bind(P5))!<number>([]);
}
export const r = [viaNonNullInstantiation(true)];