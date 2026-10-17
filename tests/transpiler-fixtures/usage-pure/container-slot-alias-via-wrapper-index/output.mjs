import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$values from "@core-js/pure/actual/object/values";
// A slot alias captures the value its initializer reads. Read-only aliases and nested wrappers preserve static and instance
// precision; writes and escapes affect only the value they can reach.
const r = {
  w: Object,
  y: [1]
};
const out = [];
const box = [r];
const viaWrapperIndex = _Object$values;
_pushMaybeArray(out).call(out, viaWrapperIndex);
export { out };