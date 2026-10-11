// a `||` whose left yields a fresh object behind an effect prefix or a store decides for that left, as
// the fresh object spelled alone does: the right never runs, so its arm names nothing, and a leaf under a
// store extracts as under the store spelled alone, in a declaration and an assignment alike - `Array` too,
// a constructor pure never respells, whose static a native read off the slot would miss
export const { C: { groupBy } } = (console.log(), { C: Map }) || { C: Object };
let stash;
export const { C: { from } } = (stash = { C: Iterator }) || { C: Array };
let held;
export const { C: { of } } = (held = { C: Array }) || { C: Object };
let box, fromAsync;
({ C: { fromAsync } } = (box = { C: Array }) || { C: Object });
export { stash, held, box, fromAsync };
