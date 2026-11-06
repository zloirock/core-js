// A local binding named globalThis does not identify the global object.
// Its array slot must not turn an unknown constructor into a known built-in.
export function shadowed(globalThis) {
  const slot = [globalThis.Array];
  return slot[0].from([1]);
}