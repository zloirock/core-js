// A retained realm read keeps its receiver, short circuit and source effects.
// Local names and computed keys must not change the polyfill or exception.
export function read() {
  const S = "self",
    P = "Promise";
  const w = globalThis.window;
  return typeof w[S][P].resolve;
}
