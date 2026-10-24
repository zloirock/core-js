import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// the superclass is a proxy-global member produced by an immediately-invoked wrapper
// (`(function(){return globalThis})().Array`); the IIFE-returned globalThis substitutes to
// `_globalThis` and `super.from` rewrites to the pure static import, exactly as a bare
// `globalThis.Array` superclass would
class X extends function () {
  return _globalThis;
}().Array {
  static make() {
    return _Array$from.call(this, [1, 2, 3]);
  }
}
X.make();