import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$keys from "@core-js/pure/actual/object/keys";
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
const seqRoot = (eff(), r);
const viaSeqRoot = _Object$keys;
_pushMaybeArray(out).call(out, viaSeqRoot);
export { out };