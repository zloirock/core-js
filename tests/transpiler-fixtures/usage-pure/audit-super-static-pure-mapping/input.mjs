// user-imported pure Promise polyfill used as `extends _Promise` superclass. super-
// static calls (`super.try`, `super.allSettled`) must map back to the Promise statics
// polyfill so the inherited dispatch resolves correctly
import _Promise from "@core-js/pure/actual/promise";
class MyPromise extends _Promise {
  static safeTry(fn) {
    return super.try(fn);
  }
  static safeAllSettled(xs) {
    return super.allSettled(xs);
  }
}
MyPromise.safeTry(() => 1);
MyPromise.safeAllSettled([1, 2]);
