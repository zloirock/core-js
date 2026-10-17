import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
let v;
let va;
export function keepValue(v) {
  return v;
}
export const valueArgSelf = keepValue((va = _globalThis, _self));