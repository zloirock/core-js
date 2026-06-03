import _Array$from from "@core-js/pure/actual/array/from";
// the IIFE returns a proxy-global MEMBER chain (`globalThis.self`), then `.Array`; both
// proxy-global hops resolve so `super.from` rewrites to the pure static import
class X extends (function () { return globalThis.self; })().Array {
  static make() {
    return _Array$from.call(this, [1, 2, 3]);
  }
}
X.make();