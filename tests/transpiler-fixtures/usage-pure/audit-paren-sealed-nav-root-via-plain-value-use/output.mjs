import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A plain read above a sealed optional value keeps the source read and its throw.
// The sealed value retains its terminal environment probe over the backed root.
export const viaPlainValueUse = (null == _globalThis.window ? void 0 : _self.window).Array;