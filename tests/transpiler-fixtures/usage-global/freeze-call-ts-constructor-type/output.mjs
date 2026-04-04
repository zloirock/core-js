function foo(x: new () => Date) {
  Object.freeze(x);
}