import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
import "core-js/modules/web.dom-collections.iterator";
// the same class-definition-time write, standing BEFORE the guard: the narrow is established after
// the decorator already ran, so it holds over the read and only the string family injects. the
// negative of the fixture beside it - a decorator write recovered without its position in the tree
// reads as a capture and bails the narrow, which over-injects here
export function f(y: any) {
  let x: any = y;
  class D {
    @(x = "s", (t: any, k: any) => t)
    m() {
      return 1;
    }
  }
  if (typeof x === "string") return x.at(0);
  return null;
}