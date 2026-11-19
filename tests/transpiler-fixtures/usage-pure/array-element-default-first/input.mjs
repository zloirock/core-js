// A live default runs after its getter and before the following native property.
export function read(receiver, fallback) {
  const [{ /* First read. */ at = fallback(), /* Native read. */ other }] = [receiver];
  return [at, other];
}
