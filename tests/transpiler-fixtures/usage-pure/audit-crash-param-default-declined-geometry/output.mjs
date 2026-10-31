import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// per-prop removal ranges on the body-extract path, which a pattern reaches only when the caller-
// correct synth is impossible: replaying a DYNAMIC computed key would re-evaluate the key expression,
// and no literal can do that without a temporary. the retained key also breaks or joins the run of
// removed props, which is what decides whether two ranges share a comma. DECLARED non-exported fns
// with no escaping call site are safe to emit lossily; exported / escaping / overridden ones stay verbatim
// a leading RUN of two removed props: the second removal must consult the first so the shared comma
// is not double-consumed (partial-overlap crash)
function leadingRun({
  [_globalThis.pick]: z
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, z];
}
leadingRun();
// the retained prop SEPARATES the removed ones, so each range is clean and they never overlap
function noncontiguous({
  [_globalThis.pick]: z
} = Object) {
  let entries = _Object$entries;
  let keys = _Object$keys;
  return [entries, keys, z];
}
noncontiguous();
// a trailing RUN whose higher-indexed prop is LAST - the shared comma sits between the removed pair
function consecutiveTail({
  [_globalThis.pick]: z
} = Object) {
  let values = _Object$values;
  let fromEntries = _Object$fromEntries;
  return [values, fromEntries, z];
}
consecutiveTail();