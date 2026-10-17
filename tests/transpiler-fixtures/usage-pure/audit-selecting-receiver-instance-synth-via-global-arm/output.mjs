import _Iterator from "@core-js/pure/actual/iterator/constructor";
const nul = null;
// ... but a part that carries a POLYFILLABLE global still bails the whole selection: the synth would
// re-emit it verbatim past the visitor, and a raw `Iterator` is a ReferenceError off-engine
export const viaGlobalArm = function ({
  map
} = nul || _Iterator.prototype) {
  return typeof map;
}();