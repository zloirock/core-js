// Transparent wrappers keep the array capture and source property order.
export function read(receiver, fallback) {
  const [{ other, at = fallback() }] = (([receiver] as unknown[]));
  return [other, at];
}
