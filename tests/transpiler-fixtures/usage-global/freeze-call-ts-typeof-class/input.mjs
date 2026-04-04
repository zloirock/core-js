class MyClass { value = 1; }
function foo(x: typeof MyClass) {
  Object.freeze(x);
}
