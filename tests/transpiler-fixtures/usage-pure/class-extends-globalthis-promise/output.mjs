import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
class MyPromise extends _Promise {
  static allResolved(promises) {
    return _Promise$allSettled.call(this, promises);
  }
}