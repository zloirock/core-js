// `globalThis?.Array` (optional access) as a superclass: the extends clause resolves to
// the global `Array`, so `super.from(...)` rewrites to the polyfilled static call.
class X extends globalThis?.Array {
  static m() { return super.from([1, 2, 3]); }
}
X.m();
