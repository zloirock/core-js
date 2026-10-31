function foo(x: Partial<{ a: number }>) {
  Object.freeze(x);
}
