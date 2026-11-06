import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
let u;
export function keep(x) {
  return x;
}
export const userConsumer = keep(null == (u = _globalThis.window) ? void 0 : _Set);