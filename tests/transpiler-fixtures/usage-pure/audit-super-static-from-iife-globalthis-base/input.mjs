// the superclass is a proxy-global member produced by an immediately-invoked wrapper
// (`(function(){return globalThis})().Array`); the IIFE-returned globalThis substitutes to
// `_globalThis` and `super.from` rewrites to the pure static import, exactly as a bare
// `globalThis.Array` superclass would
class X extends (function () { return globalThis; })().Array {
  static make() {
    return super.from([1, 2, 3]);
  }
}
X.make();
