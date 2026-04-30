// class-as-namespace probe: static fields aliasing globals must be resolved through
// findNamespaceMemberValue / resolveBindingToGlobalName. extends Box.Promise resolves to
// Promise via the static-field aliasing chain
class Box {
  static MyPromise = Promise;
}
class C extends Box.MyPromise {
  static run() {
    return super.try(() => 42);
  }
}
C.run();
