import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// `globalThis?.Array` (optional access) as a superclass: the extends clause must still be
// resolved to the global `Array`, so `super.from(...)` triggers the static-method polyfill.
class X extends globalThis?.Array {
  static m() {
    return super.from([1, 2, 3]);
  }
}
X.m();