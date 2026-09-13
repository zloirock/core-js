// A selected assignment yields its stored realm navigation to the constructor read.
// The Map claim injects while the selection, write and navigation effect stay observable.
export function read(flag) {
  let held;
  let effects = 0;
  const Constructor = (globalThis && (held = (effects++, globalThis.self).window)).Map;
  return [Constructor, held, effects];
}
