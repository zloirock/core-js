import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
// A selected assignment yields its stored realm navigation to the constructor read.
// The Map claim injects while the selection, write and navigation effect stay observable.
export function read(flag) {
  let held;
  let effects = 0;
  const Constructor = (flag ? held = (effects++, _self) : _globalThis, _Map);
  return [Constructor, held, effects];
}