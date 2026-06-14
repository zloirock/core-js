// arrow-function IIFE wrapper around the proxy-global superclass (`(() => globalThis)().Array`);
// the IIFE-returned globalThis substitutes to `_globalThis` (the `.Array` member doesn't collapse
// the receiver - Array is native here - so it stays a live reference) and `super.from` rewrites
// to the pure static import like the function-expression IIFE form
class X extends (() => globalThis)().Array {
  static make() {
    return super.from([1, 2, 3]);
  }
}
X.make();
