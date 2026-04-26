// decorated class with catch-param shadowing inside a method: shadowed names skip
// polyfill, but the surrounding decorator/method body still polyfills as usual.
class A {
  @dec(function() {
    try { throw 1; }
    catch (Array) {
      return Array.from([1]);
    }
  })
  m() {}
}
