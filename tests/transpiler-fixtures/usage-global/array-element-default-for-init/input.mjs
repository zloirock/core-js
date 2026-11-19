// A loop initializer keeps property order within the declaration.
export function read(receiver, fallback) {
  for (const [{ /* First read. */ at = fallback(), other }] = [receiver];;) return [at, other];
}
