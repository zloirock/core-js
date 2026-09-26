// An unbraced declaration preserves its branch and property order.
export function read(receiver, fallback) {
  if (receiver) var [{ other, at = fallback() }] = [receiver];
  return [at, other];
}
