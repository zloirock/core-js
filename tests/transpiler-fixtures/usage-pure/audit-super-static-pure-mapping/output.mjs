import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// User pure-imported class extended with super-static call. injector-base
// `getPureImport(name)` consumed by class-walk maps `_Promise` -> hint 'Promise'
// so resolveStaticInheritedMember locates `statics.Promise.try` polyfill
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