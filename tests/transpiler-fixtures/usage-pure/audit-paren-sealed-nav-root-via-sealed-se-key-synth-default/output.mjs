import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
let c4 = 0;
export function viaSealedSeKeySynthDefault({
  setPrototypeOf: sp2
} = (null == _globalThis.window ? void 0 : (c4++, _self)).Object) {
  return sp2;
}
export { c4 };