// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs with the literal
// init element at the same index - the binding may land on any spread element instead.
let tail = [{}, {}];
// the ASSIGNMENT form pairs the same way: a spread-shifted slot takes the guard, a sound
// pairing folds (paren drop around the pattern statement is the babel reprint)
let ax, AM, AS;
([ax, { Promise: AM }] = [...tail, globalThis]);
// control: a spread strictly AFTER the slot keeps earlier positions static - the sound slot
// folds while the sibling slot AT the spread bails, with no orphan imports left behind
const [{ Set: C }, { WeakMap: W }] = [globalThis, ...tail];
export const viaSlotAtSpread = new W();
