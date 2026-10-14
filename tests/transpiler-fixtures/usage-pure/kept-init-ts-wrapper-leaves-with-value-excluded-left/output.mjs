import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A TS wrapper around an init a static claim empties leaves with the value it wraps: a selection whose left's
// constructor entry is excluded (`globalThis.Map`, while `groupBy` keeps its own) still decides - the data subset
// carries `Map` - so its right never runs and the whole init leaves, effects and all, in a declaration and in a
// bodyless slot alike, which stays a single statement.
const groupBy = _Map$groupBy;
if (ok) var grouped = _Map$groupBy;
export { groupBy, grouped };