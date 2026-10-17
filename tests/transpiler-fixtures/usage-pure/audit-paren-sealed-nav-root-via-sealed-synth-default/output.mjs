import _globalThis from "@core-js/pure/actual/global-this";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
import _self from "@core-js/pure/actual/self";
// the probe rides the PARAM-DEFAULT synth swap too: the sealed read re-emits ahead of the
// synth literal (throw before the default binds; the nav's key SE runs once, on the probe)
export function viaSealedSynthDefault({
  getPrototypeOf: sp1
} = ((null == _globalThis.window ? void 0 : _self.window).Object, {
  getPrototypeOf: _Object$getPrototypeOf
})) {
  return sp1;
}