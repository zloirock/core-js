// A retained realm read keeps its receiver, short circuit and source effects.
// Local names and computed keys must not change the polyfill or exception.
export function read() {
  function f(Promise) {
    return typeof (globalThis.window?.Promise).resolve;
  }
  return f();
}
