// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs with the literal
// init element at the same index - the binding may land on any spread element instead.
let tail = [{}, {}];

// ctor-alias channel: M lands on `tail[1].Map` at runtime - the guard's raw branch reads that static
const [m0, { Map: M }] = [...tail, globalThis];
export const viaCtorAlias = M.groupBy([1, 2], v => v);
// the ASSIGNMENT form pairs the same way: a spread-shifted slot takes the guard, a sound
// pairing folds (paren drop around the pattern statement is the babel reprint)
let ax, AM, AS;
([ax, { Promise: AM }] = [...tail, globalThis]);
