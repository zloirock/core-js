import "core-js/modules/es.array.of";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
// member DECORATOR `this` is the OUTER scope, not the class, so `@(this.from([1]))` must NOT
// over-inject es.array.from. the method-BODY `this.of` IS the class (`C extends Array`) and
// does inject es.array.of - so the import set proves only the body `this` anchored to C.
class C extends Array {
  @(this.from([1]))
  static foo() {}
  static bar() {
    return this.of(2);
  }
}
export { C };