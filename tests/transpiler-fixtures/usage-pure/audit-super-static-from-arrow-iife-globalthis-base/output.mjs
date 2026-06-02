import _Array$from from "@core-js/pure/actual/array/from";
// arrow-function IIFE wrapper around the proxy-global superclass (`(() => globalThis)().Array`);
// `super.from` rewrites to the pure static import like the function-expression IIFE form
class X extends (() => globalThis)().Array {
  static make() {
    return _Array$from.call(this, [1, 2, 3]);
  }
}
X.make();