import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The stored value and its reader share one nullable realm probe.
// The sequence prefix runs once, including when window is absent.
let held;
export const value = held = null == (visit(), _globalThis).window ? void 0 : _self;
export { held };