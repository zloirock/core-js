import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$is from "@core-js/pure/actual/object/is";
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
let installed;
const chainInstall = (eff(), installed = r.w);
const viaChainInstall = _Object$is;
_pushMaybeArray(out).call(out, viaChainInstall);
export { out };