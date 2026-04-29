import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function assertArray(x: unknown): asserts x is Array<string> {}
function foo(x: unknown) {
  assertArray(x);
  _atMaybeArray(x).call(x, 0);
}