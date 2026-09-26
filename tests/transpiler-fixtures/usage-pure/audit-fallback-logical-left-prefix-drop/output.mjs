import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a fallback-logical synth-swap receiver (`LEFT || Set`) collapses to the synth literal: LEFT's resolved
// TAIL is replaced and the dead RIGHT operand dropped. the WHOLE left operand is skip-marked - a tail-only
// skip leaves a sequence prefix's DROPPED globals (`(globalThis.marker, globalThis.Array)`) visible to
// leak a dead `_globalThis` import; only the harvested SE is re-exposed so its own globals still polyfill.
// covers a PURE prefix (dropped whole) and a polyfillable-SE prefix (kept ahead of the literal)
const log = [];
function pureLeftPrefix({
  of
} = {
  of: _Array$of
}) {
  return of;
}
function seLeftPrefix({
  from
} = (_pushMaybeArray(log).call(log, _Object$fromEntries([])), {
  from: _Array$from
})) {
  return from;
}
export { pureLeftPrefix, seLeftPrefix };