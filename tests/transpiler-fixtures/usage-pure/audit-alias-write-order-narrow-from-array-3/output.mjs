import _globalThis from "@core-js/pure/actual/global-this";
// a NON-global pattern slot off the proxy surface is a plain property read (`globalThis.x`,
// likely undefined) - classifying it as the proxy root would un-throw the native failure;
// a proxy-global-NAMED slot legitimately re-enters the surface and collapses
const {
  x: plainSlot
} = _globalThis;
export const k = plainSlot.Array.from(items);