import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.symbol.metadata";
import "core-js/modules/web.dom-collections.iterator";
@dec(arr.at(0))
class A {
  @dec2(arr.includes(1))
  method() {}
  @dec3(arr.flat())
  field = 1;
}