import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// a spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot
// no longer pairs with the literal init element at the same index - the binding may land on any
// spread element instead. resolving past the spread judges a foreign element: the ctor alias
// would over-substitute the pure static, the symbol alias would fold a user value to the
// well-known symbol, and the type channel would narrow `.at` to the array-specific helper on a
// foreign runtime receiver. every spread-shifted binding must stay verbatim / widen to generic
let tail = [{}, {}];

// ctor-alias channel: M lands on `tail[1].Map` at runtime, the static stays untouched
const [m0, {
  Map: M
}] = [...tail, _globalThis];
export const viaCtorAlias = M.groupBy([1, 2], v => v);

// symbol-alias channel: S lands on a user value, the well-known key must not fold
const [s0, {
  Symbol: S
}] = [...tail, _globalThis];
export const viaSymbolAlias = [1, 2][S.iterator];

// type channel: A is not provably Array, `.at` widens to the generic helper
const [a0, {
  Array: A
}] = [...tail, _globalThis];
export const viaTypeNarrow = _at(_ref = new A()).call(_ref, 0);

// deep array-wrap layers: the spread shifts the INNER level, the recursion bails the same way
const [[i0, {
  Iterator: I
}]] = [[...tail, _globalThis]];
export const viaDeepSpread = I.range(0, 3);

// spread AT the slot bails too (position is runtime-determined from the spread on)
let head = [_globalThis];
const [{
  Promise: P
}] = [...head];
export const viaSpreadAt = P.allSettled([]);

// the ASSIGNMENT form pairs the same way: a spread-shifted slot stays verbatim, a sound
// pairing folds (paren drop around the pattern statement is the babel reprint)
let ax, AM, AS;
[ax, {
  Promise: AM
}] = [...tail, _globalThis];
export const viaAssignSpread = AM.try(task);
AS = _Set;
export const viaAssignSound = new AS(soundSeed);

// control: a HOLE before the slot is not a spread - positions stay static and the pairing
// folds (only a spread makes later positions runtime-determined)
const HM = _Map;
const [, {
  Map: _unused
}] = [, _globalThis];
export const viaHoleBeforeSlot = _Map$groupBy([3, 4], v => v);

// control: a spread strictly AFTER the slot keeps earlier positions static - the sound slot
// folds while the sibling slot AT the spread bails, with no orphan imports left behind
const C = _Set;
const [{
  Set: _unused2
}, {
  WeakMap: W
}] = [_globalThis, ...tail];
export const viaSpreadAfter = new C(afterSeed);
export const viaSlotAtSpread = new W();