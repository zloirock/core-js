function myFunc() {
  return 42;
}
function foo(x: typeof myFunc) {
  Object.freeze(x);
}