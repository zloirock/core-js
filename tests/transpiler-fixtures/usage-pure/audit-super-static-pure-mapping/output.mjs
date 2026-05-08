import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$try from "@core-js/pure/actual/promise/try";
// user-imported pure Promise polyfill used as `extends _Promise` superclass. super-
// static calls (`super.try`, `super.allSettled`) must map back to the Promise statics
// polyfill so the inherited dispatch resolves correctly
import _Promise from "@core-js/pure/actual/promise";
class MyPromise extends _Promise {
  static safeTry(fn) {
    return _Promise$try.call(this, fn);
  }
  static safeAllSettled(xs) {
    return _Promise$allSettled.call(this, xs);
  }
}
MyPromise.safeTry(() => 1);
MyPromise.safeAllSettled([1, 2]);