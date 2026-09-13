// An effectful sequence arm still yields the realm and needs the Map polyfill.
// Run the effect once, only when its arm is selected.
export function read(flag) {
  let effects = 0;
  return [(flag ? (effects++, globalThis.self) : globalThis).Map, effects];
}
