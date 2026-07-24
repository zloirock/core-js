import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// the superclass is a user-namespace member returned by a zero-arg IIFE
// (`(() => ({ Base: Promise }))().Base`): the wrapper peels to the object literal, `.Base`
// resolves to Promise, so `super.allSettled` rewrites to the pure static - matching how an
// IIFE returning globalThis resolves its proxy-global member (the namespace side must not
// under-resolve where the global side already peels the same wrapper)
class C extends (() => ({
  Base: _Promise
}))().Base {
  static run(x) {
    return _Promise$allSettled.call(this, x);
  }
}
C.run([]);