// generator-like return types include `Iterator<TYield, TReturn, TNext>` per TS lib.
// `yield* delegate` evaluates to delegate's TReturn  -  must narrow from the type-param
// exactly like Generator<TYield, TReturn, TNext> does
function* delegate(): Iterator<number, string[], void> {
  return ["a", "b", "c"];
}
function* outer() {
  // @ts-expect-error an await over a value tsc refuses is the shape under test
  const r = yield* delegate();
  r.at(0);
}
outer();
