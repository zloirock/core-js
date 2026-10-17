import _globalThis from "@core-js/pure/actual/global-this";
// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs with the literal
// init element at the same index - the binding may land on any spread element instead.
let tail = [{}, {}];
// deep array-wrap layers: the spread shifts the INNER level, the recursion bails the same way
const [[i0, {
  Iterator: I
}]] = [[...tail, _globalThis]];
export const viaDeepSpread = I.range(0, 3);
// the ASSIGNMENT form pairs the same way: a spread-shifted slot takes the guard, a sound
// pairing folds (paren drop around the pattern statement is the babel reprint)
let ax, AM, AS;
[ax, {
  Promise: AM
}] = [...tail, _globalThis];