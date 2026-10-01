// A known slot before an opaque spread keeps its instance polyfill.
// The spread evaluates first; getter reads and bindings then follow source order.
export function read(make, values) {
  const [before, { at }, ...rest] = [2, make(() => [before, rest]), ...values];
  return [before, at, rest];
}
