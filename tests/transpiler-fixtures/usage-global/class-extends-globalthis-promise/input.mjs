class MyPromise extends globalThis.Promise {
  static allResolved(promises) {
    return super.allSettled(promises);
  }
}
