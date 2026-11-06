// decorator expression itself uses a polyfilled built-in: the call inside the
// decorator parens is scanned and rewritten.
@Promise.resolve(decorator)
class A {
  @Array.from([1, 2, 3])
  method() {}
}
