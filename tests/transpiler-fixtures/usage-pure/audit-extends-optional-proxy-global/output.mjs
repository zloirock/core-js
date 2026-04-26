import _globalThis from "@core-js/pure/actual/global-this";
import _Array$from from "@core-js/pure/actual/array/from";
// `globalThis?.Array` (optional access) as a superclass: the extends clause resolves to
// the global `Array`, so `super.from(...)` rewrites to the polyfilled static call.
class X extends _globalThis.Array {
  static m() {
    return _Array$from.call(this, [1, 2, 3]);
  }
}
X.m();