import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// An unclaimed native static keeps its pattern and the live probe's possible throw.
export const {
  Math: {
    floor: viaAnchoredLiveFloor
  }
} = null == _globalThis.window ? void 0 : _self;