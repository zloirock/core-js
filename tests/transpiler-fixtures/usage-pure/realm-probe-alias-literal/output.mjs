import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A retained realm read keeps its receiver, short circuit and source effects.
// Local names and computed keys must not change the polyfill or exception.
export function read() {
  const w = _globalThis.window;
  return typeof (w["Promise"], _Promise$resolve);
}