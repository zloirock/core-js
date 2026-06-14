import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// the IIFE returns a proxy-global MEMBER chain (`globalThis.self`), then `.Array`; the chain
// collapses to its pure leaf (`globalThis.self` -> `_self`) and `super.from` rewrites to the
// pure static import
class X extends (function () { return _self; })().Array {
  static make() {
    return _Array$from.call(this, [1, 2, 3]);
  }
}
X.make();