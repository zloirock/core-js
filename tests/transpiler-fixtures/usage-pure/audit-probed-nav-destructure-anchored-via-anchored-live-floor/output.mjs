import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// member-read anchor (no whole-ctor pure entry) over a LIVE probe
export const {
  floor: viaAnchoredLiveFloor
} = (null == _globalThis.window ? void 0 : _self).Math;