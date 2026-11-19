import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot
// no longer pairs with the literal init element at the same index - the binding may land on any
// spread element instead. resolving past the spread judges a foreign element: the ctor alias
// would over-substitute the pure static, the symbol alias would fold a user value to the
// well-known symbol, and the type channel would narrow `.at` to the array-specific helper on a
// foreign runtime receiver. a spread-shifted binding never substitutes: a static read off it takes
// the runtime identity guard against its lone candidate (the raw branch reads the runtime value),
// a well-known-symbol read folds only when the guard proves the realm Symbol, and the type
// channel widens to generic
let tail = [{}, {}];
// the ASSIGNMENT form pairs the same way: a spread-shifted slot takes the guard, a sound
// pairing folds (paren drop around the pattern statement is the babel reprint)
let ax, AM, AS;
[ax, {
  Promise: AM
}] = [...tail, _globalThis];
export const viaAssignSpread = (AM === _Promise ? _Promise$try : AM.try.bind(AM))(task);