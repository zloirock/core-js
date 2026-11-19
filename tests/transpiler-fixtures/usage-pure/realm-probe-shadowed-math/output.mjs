import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// A retained realm read keeps its receiver, short circuit and source effects.
// Local names and computed keys must not change the polyfill or exception.
export function read() {
  function f(Math) {
    return ((_globalThis.window?.Math).trunc, _Math$trunc)(3.5);
  }
  return f();
}