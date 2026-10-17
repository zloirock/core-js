import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$values from "@core-js/pure/actual/object/values";
// A slot alias captures the value its initializer reads. Read-only aliases and nested wrappers preserve static and instance
// precision; writes and escapes affect only the value they can reach.
const r = {
  w: Object,
  y: [1]
};
function eff() {
  return 0;
}
const out = [];
var _ref = [eff(), r],
  _ref$ = _ref[1],
  _ref$$w = _ref$.w,
  viaLoweredWrapper = _Object$values;
_pushMaybeArray(out).call(out, viaLoweredWrapper);
export { out };