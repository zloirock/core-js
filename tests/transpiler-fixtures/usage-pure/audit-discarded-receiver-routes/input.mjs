// two routes a DISCARDED receiver takes, and what each owes the claims inside it. the bodyless
// slot lifts an SE prefix into the block it opens: the lift must carry the LIVE nodes, or a claim
// rendered inside the prefix (`arr.flat()`) is spelled back in its source form with the polyfill
// lost. the assignment host lifts a CALL-rooted receiver the same way even when the call is quiet -
// a receiver with nothing to rescue still owes its read a slot, and without one the claim had no
// route at all. the emitters part only on the quiet read itself: the babel leg keeps it, this one
// drops it, which is the locked divergence for every discarded read that observes nothing
const arr = [1, [2]];
function mk() { return globalThis; }
export function bodylessLiftedPrefix() {
  if (1) var { Map: { groupBy } } = (arr.flat(), globalThis);
  return typeof groupBy;
}
export function bodylessLiftedPrefixWhile() {
  do var { Object: { entries } } = (arr.flat(), globalThis); while (0);
  return typeof entries;
}
export function assignOverQuietCallRoot() {
  let of;
  ({ of } = mk().Array);
  return typeof of;
}
export function assignOverEffectfulCallRoot() {
  let from;
  ({ from } = mk().Array);
  return typeof from;
}
