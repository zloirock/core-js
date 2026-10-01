import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
// `this.X` in a static method of `class C extends KnownGlobal` resolves to `KnownGlobal.X` at
// runtime - static `this` is the constructor, lookups walk the inherited static surface.
// dispatch emits `es.promise.try` symmetric with the `super.X` form
class C extends Promise {
  static foo() {
    return this.try(() => 1);
  }
}
C.foo();