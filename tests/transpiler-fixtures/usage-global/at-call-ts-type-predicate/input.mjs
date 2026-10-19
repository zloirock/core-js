function isString(x: unknown): x is string {
  return externalLib.check(x);
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
isString(x).at(-1);
