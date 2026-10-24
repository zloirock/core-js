// ... and the same four off an alias whose assignment DOMINATES every read
export function unconditionalNested() {
  var G = globalThis;
  const { Object: { entries } } = G;
  return entries({ a: 1 });
}
