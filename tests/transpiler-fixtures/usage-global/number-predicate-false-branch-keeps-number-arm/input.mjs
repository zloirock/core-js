// `Number.isFinite` and `Number.isSafeInteger` hold for only part of `number`: a false answer leaves the
// argument a possible number (`NaN`, `1.5`), so where the test failed the union keeps its number arm
// and a member only that arm carries still injects - only a true answer narrows
export function viaNegatedTest(x: string | number) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  if (!Number.isFinite(x)) return x.toFixed(1);
}
export function viaLogicalOr(x: string | number) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return Number.isSafeInteger(x) || x.toExponential(1);
}
