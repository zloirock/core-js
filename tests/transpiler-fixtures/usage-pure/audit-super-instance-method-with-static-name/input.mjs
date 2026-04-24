// `super.try` from an INSTANCE method of a subclass of Promise - runtime semantics:
// looks up `Promise.prototype.try`, which doesn't exist. User code is semantically broken.
// Plugin should NOT polyfill this as `Promise.try` (which is static-surface), because
// the static polyfill on an instance-super lookup would mask the real bug.
// This is the same bail path as `audit-super-instance-get` - instance super.X is out
// of scope of the resolver, leaving user code unchanged.
class C extends Promise {
  method() {
    return super.try(() => 1);
  }
}
