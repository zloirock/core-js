// the superclass is a user-namespace member returned by a zero-arg IIFE
// (`(() => ({ Base: Promise }))().Base`): the wrapper peels to the object literal, `.Base`
// resolves to Promise, so `super.allSettled` rewrites to the pure static - matching how an
// IIFE returning globalThis resolves its proxy-global member (the namespace side must not
// under-resolve where the global side already peels the same wrapper)
class C extends (() => ({ Base: Promise }))().Base {
  static run(x) {
    return super.allSettled(x);
  }
}
C.run([]);
