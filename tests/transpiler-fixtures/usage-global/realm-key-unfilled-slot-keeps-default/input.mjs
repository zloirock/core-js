// A key read off the realm whose global core-js implements nothing of (`Float16Array`, whose definition
// lists methods alone; `BigInt`) names a slot a target may leave empty: an engine lacking it runs the level's
// default, which keeps its own module, through a realm hop too. A global core-js implements fills its slot
// everywhere, so its default is dead (`Map`) - unless this file writes the slot, which may then hold anything,
// the default live again (`WeakSet`).
const { Float16Array: { from } = Array } = globalThis;
const { BigInt: { asUintN } = shimBigInt } = globalThis;
const { self: { Float16Array: { of } = Array } } = globalThis;
const { Map: { groupBy } = Object } = globalThis;
globalThis.WeakSet = maybeWeakSet;
const { WeakSet: { fromEntries } = Object } = globalThis;
export { from, asUintN, of, groupBy, fromEntries };
