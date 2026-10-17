import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A slot alias captures the value its initializer reads. Read-only aliases and nested wrappers preserve static and instance
// precision; writes and escapes affect only the value they can reach.
const r = {
  w: Object,
  y: [1]
};
const out = [];
const instanceAlias = r.y;
const viaInstanceAlias = _atMaybeArray(instanceAlias);
_pushMaybeArray(out).call(out, viaInstanceAlias);
export { out };