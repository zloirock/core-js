import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$entries from "@core-js/pure/actual/object/entries";
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
const seqAlias = (eff(), r.w);
const viaSeqAlias = _Object$entries;
_pushMaybeArray(out).call(out, viaSeqAlias);
export { out };