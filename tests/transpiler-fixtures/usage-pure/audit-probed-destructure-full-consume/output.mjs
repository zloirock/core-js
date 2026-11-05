import _globalThis from "@core-js/pure/actual/global-this";
import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Object$seal from "@core-js/pure/actual/object/seal";
import _self from "@core-js/pure/actual/self";
import _structuredClone from "@core-js/pure/actual/structured-clone";
// Fully consumed realm patterns retain the probe read that can throw before extraction.
// The array-contained static remains native and performs its own read.
export const {
  Math: {
    cbrt: viaMultiPropA
  },
  Object: {
    seal: viaMultiPropB
  }
} = ({} = null == _globalThis.window ? void 0 : _self, {
  Math: {
    cbrt: _Math$cbrt
  },
  Object: {
    seal: _Object$seal
  }
});
export const viaFlatBareNav = ((null == _globalThis.window ? void 0 : _self).structuredClone, _structuredClone);
export const [{
  Math: {
    hypot: viaArrayWrapped
  }
}] = [null == _globalThis.window ? void 0 : _self];
let viaAssignFull;
({
  Math: {
    sign: viaAssignFull
  }
} = ({} = null == _globalThis.window ? void 0 : _self, {
  Math: {
    sign: _Math$sign
  }
}));
export { viaAssignFull };