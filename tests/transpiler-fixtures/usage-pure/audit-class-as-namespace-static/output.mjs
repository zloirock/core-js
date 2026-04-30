import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// class-as-namespace probe: static fields aliasing globals must be resolved through
// findNamespaceMemberValue / resolveBindingToGlobalName. extends Box.Promise resolves to
// Promise via the static-field aliasing chain
class Box {
  static MyPromise = _Promise;
}
class C extends Box.MyPromise {
  static run() {
    return _Promise$try.call(this, () => 42);
  }
}
C.run();