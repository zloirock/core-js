function isString(x: unknown): x is string {
  return externalLib.check(x);
}
isString(x).at(-1);
