import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// The marker may be a getter. Keep its read and the polyfilled call in the other prefix
// before substituting the selected Array method. The right fallback is unreachable.
const log = [];
function pureLeftPrefix({
  of
} = (_globalThis.marker, {
  of: _Array$of
})) {
  return of;
}
function seLeftPrefix({
  from
} = ((_pushMaybeArray(log) || 0).call(log, _Object$fromEntries([])), {
  from: _Array$from
})) {
  return from;
}
export { pureLeftPrefix, seLeftPrefix };