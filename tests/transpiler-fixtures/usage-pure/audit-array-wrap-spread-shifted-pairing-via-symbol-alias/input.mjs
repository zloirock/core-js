// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs with the literal
// init element at the same index - the binding may land on any spread element instead.
let tail = [{}, {}];
// symbol-alias channel: S lands on a user value - the guard folds the key only for the realm Symbol
const [s0, { Symbol: S }] = [...tail, globalThis];
export const viaSymbolAlias = [1, 2][S.iterator];
// the ASSIGNMENT form pairs the same way: a spread-shifted slot takes the guard, a sound
// pairing folds (paren drop around the pattern statement is the babel reprint)
let ax, AM, AS;
([ax, { Promise: AM }] = [...tail, globalThis]);
