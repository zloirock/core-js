// arrow-function IIFE wrapper around the proxy-global superclass (`(() => globalThis)().Array`);
// `super.from` rewrites to the pure static import like the function-expression IIFE form
class X extends (() => globalThis)().Array {
  static make() {
    return super.from([1, 2, 3]);
  }
}
X.make();
