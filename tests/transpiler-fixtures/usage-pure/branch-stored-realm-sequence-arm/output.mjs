import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
// An effectful sequence arm still yields the realm and needs the Map polyfill.
// Run the effect once, only when its arm is selected.
export function read(flag) {
  let effects = 0;
  return [(flag ? (effects++, _self) : _globalThis, _Map), effects];
}