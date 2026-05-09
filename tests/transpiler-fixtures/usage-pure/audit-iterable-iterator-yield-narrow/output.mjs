import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// generator-like return types include `Iterator<TYield, TReturn, TNext>` per TS lib.
// `yield* delegate` evaluates to delegate's TReturn — must narrow from the type-param
// exactly like Generator<TYield, TReturn, TNext> does
function* delegate(): Iterator<number, string[], void> {
  return ["a", "b", "c"];
}
function* outer() {
  const r = yield* delegate();
  _atMaybeArray(r).call(r, 0);
}
outer();