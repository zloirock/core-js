import "core-js/modules/es.global-this";
import "core-js/modules/es.math.trunc";
// A retained realm read keeps its receiver, short circuit and source effects.
// Local names and computed keys must not change the polyfill or exception.
export function read() {
  function f(Math) {
    return (globalThis.window?.Math).trunc(3.5);
  }
  return f();
}