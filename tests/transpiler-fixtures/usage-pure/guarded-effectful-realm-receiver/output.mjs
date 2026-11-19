import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
export function read(mark) {
  const s = _globalThis.self;
  return [s?.[mark(), 'self'].value, s === _globalThis, _self === _globalThis];
}