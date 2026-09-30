// Mirrorable mixed defaults bind constructor ponyfills beside nested native reads.
// A declined mirror permits only a proven body extraction, never parameter leaf defaults.
// Wrappers and parameter-scope uses must preserve the same constructor choice.
export const unresolvableKey = (({ Set, Array: { from }, [getKey()]: y } = globalThis) => [Set, from, y])();
export const duplicateKey = (({ Map, ["Map"]: alias, Array: { of } } = globalThis) => [Map, alias, of])();
export const nonIdentifierKey = (({ WeakSet, "with-dash": dashed, Array: { isArray } } = globalThis) => [WeakSet, dashed, isArray])();
export const mirrorable = (({ Promise, Array: { at } } = globalThis) => [Promise, at])();

export const restSibling = (({ Set: S2, Array: { of: of2 }, ...rest } = globalThis) => [S2, of2, rest])();
export const twoFlatKeys = (({ WeakMap, Promise: P2, Array: { from: from2 } } = globalThis) => [WeakMap, P2, from2])();
export const nestedKeyFirst = (({ Array: { at: at7 }, Set: S7 } = globalThis) => [at7, S7])();
export const twoNestedValues = (({ Set: S8, Array: { of: of8 }, Promise: { race } } = globalThis) => [S8, of8, race])();

// the same mixed pattern one level down - inside an array or object pattern - is a level the mirror
// climbs through: the default is mirrored whole for the slot the call leaves empty, and no per-key
// fallback stands beside it (what the literal supplies is never undefined)
export const nestedInArrayPattern = (([{ Set: S3, Array: { of: of3 } } = globalThis]) => [S3, of3])([]);
export const nestedInObjectPattern = (({ p: { Map: M3, Array: { from: from3 } } = globalThis }) => [M3, from3])({});
export const nestedTwoLevels = (([[{ WeakSet: W3, Array: { at: at3 } } = globalThis]]) => [W3, at3])([[]]);

// a statement body, a name read by a later parameter and a name bound in the body take the same
// mirror - the body shape and the scope no longer pick an emission path here
export const statementBody = (([{ Set: S4, Array: { of: of4 } } = globalThis]) => {
  return [S4, of4];
})([]);
export const nameReadByLaterParam = (([{ Set: S5, Array: { of: of5 } } = globalThis], echo = S5) => {
  return [S5, of5, echo];
})([]);
export const nameBoundInBody = (([{ Set: S6, Array: { of: of6 } } = globalThis]) => {
  var S6;
  return [S6, of6];
})([]);

// An unresolvable nested key declines the mirror in both body forms.
// The default-only block extracts its flat constructor; the expression body stays native.
export const statementBodyBail = (([{ Set: S7, [getKey()]: y7, Array: { of: of7 } } = globalThis]) => {
  return [S7, of7, y7];
})([]);
export const expressionBodyBail = (([{ Set: S8, [getKey()]: y8, Array: { of: of8 } } = globalThis]) => [S8, of8, y8])([]);
