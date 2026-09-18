// A shadowed default cannot name a static, but a known caller still supplies Array.of.
// Only the selected static is needed; a missing element keeps the custom default.
export function outer(Array) {
  function read([{ of } = Array], value) { return of(value); }
  return [read([globalThis.Array], 1), read([undefined], 2)];
}
