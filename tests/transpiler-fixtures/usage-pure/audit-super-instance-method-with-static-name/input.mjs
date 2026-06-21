// `super.try` from an INSTANCE method of a subclass of Promise resolves to
// `Promise.prototype.try`, which doesn't exist - user code is semantically broken. it must
// NOT be polyfilled as the static `Promise.try`, which would mask the real bug. instance
// `super.X` is out of resolver scope, so user code stays unchanged.
class C extends Promise {
  method() {
    return super.try(() => 1);
  }
}
