// decorator expression itself uses a polyfilled built-in: the expression is scanned
// and the runtime call inside the decorator is rewritten.
@Promise.resolve(decorator)
class A {
  @Array.from([1, 2, 3])
  method() {}
}
