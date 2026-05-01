// User pure-imported class extended with super-static call. injector-base
// `getPureImport(name)` consumed by class-walk maps `_Promise` -> hint 'Promise'
// so resolveStaticInheritedMember locates `statics.Promise.try` polyfill
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
