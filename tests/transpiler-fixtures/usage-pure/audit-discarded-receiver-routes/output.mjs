import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
// two routes a DISCARDED receiver takes, and what each owes the claims inside it. the bodyless
// slot lifts an SE prefix into the block it opens: the lift must carry the LIVE nodes, or a claim
// rendered inside the prefix (`arr.flat()`) is spelled back in its source form with the polyfill
// lost. the assignment host lifts a CALL-rooted receiver the same way even when the call is quiet -
// a receiver with nothing to rescue still owes its read a slot, and without one the claim had no
// route at all. the emitters part only on the quiet read itself: the babel leg keeps it, this one
// drops it, which is the locked divergence for every discarded read that observes nothing
const arr = [1, [2]];
function mk() {
  return _globalThis;
}
export function bodylessLiftedPrefix() {
  if (1) {
    _flatMaybeArray(arr).call(arr);
    var groupBy = _Map$groupBy;
  }
  return typeof groupBy;
}
export function bodylessLiftedPrefixWhile() {
  do {
    _flatMaybeArray(arr).call(arr);
    var entries = _Object$entries;
  } while (0);
  return typeof entries;
}
export function assignOverQuietCallRoot() {
  let of;
  mk().Array;
  of = _Array$of;
  return typeof of;
}
export function assignOverEffectfulCallRoot() {
  let from;
  mk().Array;
  from = _Array$from;
  return typeof from;
}