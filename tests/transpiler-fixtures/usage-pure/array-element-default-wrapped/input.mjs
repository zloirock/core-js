// Transparent wrappers keep the array capture and source property order.
export function read(receiver, fallback) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  const [{ other, at = fallback() }] = (([receiver] as unknown[]));
  return [other, at];
}
