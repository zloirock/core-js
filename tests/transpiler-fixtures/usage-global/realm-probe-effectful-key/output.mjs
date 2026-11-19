import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A retained realm read keeps its receiver, short circuit and source effects.
// Local names and computed keys must not change the polyfill or exception.
export function read() {
  function f(Array) {
    const {
      from
    } = globalThis.window?.[note(), "Array"];
    return from([3])[0];
  }
  return f();
}