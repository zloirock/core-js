// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs with the literal
// init element at the same index - the binding may land on any spread element instead.
let tail = [{}, {}];
// type channel: A is not provably Array, `.at` widens to the generic helper
const [a0, { Array: A }] = [...tail, globalThis];
export const viaTypeNarrow = new A().at(0);
// the ASSIGNMENT form pairs the same way: a spread-shifted slot takes the guard, a sound
// pairing folds (paren drop around the pattern statement is the babel reprint)
let ax, AM, AS;
([ax, { Promise: AM }] = [...tail, globalThis]);
