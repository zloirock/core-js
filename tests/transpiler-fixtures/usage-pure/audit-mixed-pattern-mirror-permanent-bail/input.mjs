// A mixed pattern - a nested-ObjectPattern value beside flat keys - belongs to the nested mirror
// only while the mirror can actually render it. An unresolvable computed key, a duplicate resolved
// key and a non-identifier key each make it bail for good, and deferring to it then drops the flat
// sibling's polyfill to a native read. The last host is the control: with every key mirrorable the
// whole default is replaced by the synthesized literal instead.
// usage-global is not paired: this rewrite exists only on the pure path, which is what binds a
// polyfill to a destructured name.
export const unresolvableKey = (({ Set, Array: { from }, [getKey()]: y } = globalThis) => [Set, from, y])();
export const duplicateKey = (({ Map, ["Map"]: alias, Array: { of } } = globalThis) => [Map, alias, of])();
export const nonIdentifierKey = (({ WeakSet, "with-dash": dashed, Array: { isArray } } = globalThis) => [WeakSet, dashed, isArray])();
export const mirrorable = (({ Promise, Array: { at } } = globalThis) => [Promise, at])();

// a rest element is the mirror's other permanent bail, and several flat keys in front of the nested
// value are the transient case the deferral exists for - the whole default becomes the synthesized
// literal there instead of per-key inline defaults
export const restSibling = (({ Set: S2, Array: { of: of2 }, ...rest } = globalThis) => [S2, of2, rest])();
export const twoFlatKeys = (({ WeakMap, Promise: P2, Array: { from: from2 } } = globalThis) => [WeakMap, P2, from2])();
export const nestedKeyFirst = (({ Array: { at: at7 }, Set: S7 } = globalThis) => [at7, S7])();
export const twoNestedValues = (({ Set: S8, Array: { of: of8 }, Promise: { race } } = globalThis) => [S8, of8, race])();

// the same mixed pattern one level down - inside an array or object pattern - has no host the
// nested mirror can anchor to, so it never renders there and the flat sibling has to be served by
// the per-key fallback instead of waiting for a synth that will not come
export const nestedInArrayPattern = (([{ Set: S3, Array: { of: of3 } } = globalThis]) => [S3, of3])([]);
export const nestedInObjectPattern = (({ p: { Map: M3, Array: { from: from3 } } = globalThis }) => [M3, from3])({});
export const nestedTwoLevels = (([[{ WeakSet: W3, Array: { at: at3 } } = globalThis]]) => [W3, at3])([[]]);

// a statement body takes the other emission path for the same shape - the flat sibling is hoisted
// as a binding at the body top instead of becoming an inline default
export const statementBody = (([{ Set: S4, Array: { of: of4 } } = globalThis]) => {
  return [S4, of4];
})([]);

// hoisting the binding is refused when the name is already read by a later parameter or already
// bound in the body - both fall back to the inline default, which changes no scope
export const nameReadByLaterParam = (([{ Set: S5, Array: { of: of5 } } = globalThis], echo = S5) => {
  return [S5, of5, echo];
})([]);
export const nameBoundInBody = (([{ Set: S6, Array: { of: of6 } } = globalThis]) => {
  var S6;
  return [S6, of6];
})([]);
