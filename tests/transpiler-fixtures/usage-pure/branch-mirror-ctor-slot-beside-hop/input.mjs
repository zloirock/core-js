// A prop the pattern reads as a plain CONSTRUCTOR is a SLOT of the branch literal, not a reason to
// decline it: the mirror REPLACES the receiver, so a literal missing that key would answer
// `undefined` where the source read the realm. It rides the hop's literal as the constructor's own
// ponyfill, under a shared proxy step and flat off the branch root alike, and a slot whose level is
// no proxy keeps the whole step - the literal cannot spell a constructor nothing names. What keeps
// the branch alive is the receiver: a fallback that is not the realm, or an arm a TEST selects -
// a selection every arm of which IS the realm names one object and drops instead.
/* eslint-disable no-restricted-globals, unicorn/prefer-global-this -- the bare proxy names are the shape under test */
const { self: { Map: { groupBy: grouped }, Set: SetCtor } } = window ?? globalThis;
const { Map: { groupBy: flatGrouped }, Set: FlatSet } = window ?? globalThis;
const box = { Map, Set };
const { Map: { groupBy: keptGrouped }, Set: KeptSet } = globalThis.window ?? box;
export function pickedArm(c) {
  const { Map: { groupBy: armGrouped }, Set: ArmSet } = c ? globalThis : {};
  return [armGrouped, ArmSet];
}
export { grouped, SetCtor, flatGrouped, FlatSet, keptGrouped, KeptSet };
