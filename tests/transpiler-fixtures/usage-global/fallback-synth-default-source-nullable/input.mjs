// Null is supplied to the pattern, not replaced by the parameter default.
export function nullable(pick) {
  return (({ from } = Array) => from([8]))(pick ? null : globalThis.Array);
}
