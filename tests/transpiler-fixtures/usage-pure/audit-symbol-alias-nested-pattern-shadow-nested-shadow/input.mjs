const { iterator } = Symbol;
export function nestedShadow() {
  const { constructor: { iterator } } = Symbol;
  return [3, 4][iterator];
}
