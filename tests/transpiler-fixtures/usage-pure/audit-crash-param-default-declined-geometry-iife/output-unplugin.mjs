import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// IIFE twin of the declined-geometry shapes: an immediately invoked function has every call site
// visible, so the same per-prop removal ranges run on a different host node. the DYNAMIC computed key
// is what keeps these off the synth path - replaying it would re-evaluate the key expression
// a leading RUN of two removed props shares a comma between them
const leadingRun = (function ({ [_globalThis.pick]: z } = Array) {
  let from = _Array$from;
  let of = _Array$of; return [from, of, z]; })();
// the retained prop separates the removed ones, so the two ranges stay disjoint
const noncontiguous = (function ({ [_globalThis.pick]: z } = Object) {
  let entries = _Object$entries;
  let keys = _Object$keys; return [entries, keys, z]; })();
// a trailing RUN whose higher-indexed prop is LAST
const consecutiveTail = (function ({ [_globalThis.pick]: z,  } = Object) {
  let values = _Object$values;
  let fromEntries = _Object$fromEntries; return [values, fromEntries, z]; })();
export { leadingRun, noncontiguous, consecutiveTail };