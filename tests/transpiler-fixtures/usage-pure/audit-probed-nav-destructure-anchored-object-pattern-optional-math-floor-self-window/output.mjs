import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A for-init retains the live probe's guard and the native static's pattern.
// The computed key runs through the trailing sink at its original evaluation point.
let f2 = 0;
for (const {
  Math: {
    floor: viaForInitAnchor
  }
} = null == _globalThis.window ? void 0 : _self; f2 < 1; f2++) {
  void viaForInitAnchor;
}
export { f2 };