// A retained realm read keeps its receiver, short circuit and source effects.
// Local names and computed keys must not change the polyfill or exception.
export function read() {
  let Number;
  return (globalThis.window?.Number).isInteger(3);
}
