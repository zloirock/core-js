import _Array$of from "@core-js/pure/actual/array/of";
// a member DECORATOR expression evaluates at class-definition time in the OUTER scope, so its
// `this` is NOT the class - `@(this.from([1]))` must NOT be attributed to `C extends Array` and
// rewritten to `_Array$from` (that miscompiles, discarding the outer `this`). a `this.X` read in
// the method BODY, by contrast, IS the class and narrows correctly. distinct statics (from vs of)
// show which `this` resolved: only the body `this.of` becomes a polyfill.
class C extends Array {
  @(this.from([1]))
  static foo() {}
  static bar() {
    return _Array$of.call(this, 2);
  }
}
export { C };