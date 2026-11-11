// The fallback receiver is mirrored without replacing an explicitly supplied value.
export function read({ w: { Array: { from } } = choose() ? globalThis : {} } = {}) {
  return from([7]);
}
