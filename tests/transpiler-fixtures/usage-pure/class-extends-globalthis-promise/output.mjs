import _Promise from "@core-js/pure/actual/promise/constructor";
class MyPromise extends _Promise {
  static allResolved(promises) {
    return super.allSettled(promises);
  }
}