import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _self from "@core-js/pure/actual/self";
// FULL consume: the extraction carries the guarded anchor read as a throw probe, once per
// pattern (native throws before any prop read)
export const {
  JSON: {
    stringify: viaAnchoredSealedFull
  }
} = ({} = null == _globalThis.window ? void 0 : _self, {
  JSON: {
    stringify: _JSON$stringify
  }
});