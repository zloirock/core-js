import _globalThis from "@core-js/pure/actual/global-this";
import _Object$values from "@core-js/pure/actual/object/values";
import _self from "@core-js/pure/actual/self";
// the cast-seal probes ride the CLAIM, DESTRUCTURE and SYNTH channels too (erasure keeps
// the paren seal; the throw probe re-emits the sealed read, the key SE runs on it once)
let c2 = 0;
export function castSealSynth({
  values: sv
} = ((null == _globalThis.window ? void 0 : (c2++, _self)).Object, {
  values: _Object$values
})) {
  return sv;
}
export { c2 };