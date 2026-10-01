function foo(x: $ReadOnly<{
  a: number
}>) {
  Object.freeze(x);
}