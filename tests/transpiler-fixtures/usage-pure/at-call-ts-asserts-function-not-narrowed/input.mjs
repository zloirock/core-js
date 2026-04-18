function assertArray(x: unknown): asserts x is Array<string> {}
function foo(x: unknown) {
  assertArray(x);
  x.at(0);
}
