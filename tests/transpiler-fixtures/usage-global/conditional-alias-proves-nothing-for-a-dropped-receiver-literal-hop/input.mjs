export function literalHop(flag) {
  if (flag) { var G = globalThis; }
  const { w: { Array: { from } } } = { w: G };
  return from([5]);
}
