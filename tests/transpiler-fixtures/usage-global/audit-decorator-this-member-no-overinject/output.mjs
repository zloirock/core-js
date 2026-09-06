import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
import "core-js/modules/web.dom-collections.iterator";
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