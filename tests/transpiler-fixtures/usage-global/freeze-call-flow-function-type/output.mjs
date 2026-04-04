function foo(x: () => void) {
  Object.freeze(x);
}