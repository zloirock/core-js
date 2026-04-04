function foo(x: Readonly<{ a: number }>) {
  Object.freeze(x);
}
