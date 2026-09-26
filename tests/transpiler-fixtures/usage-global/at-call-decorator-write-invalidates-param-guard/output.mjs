import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
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
// a decorator expression evaluates at class-definition time, ahead of every static field, so the
// write inside one reaches the field's read: `x` holds the array there, not the string the guard
// narrowed to, and both families inject. the write is spelled ONLY in the decorator, so a walk that
// does not enter one reports the parameter constant and leaves the array polyfill out
export function f(x: any) {
  if (typeof x === "string") {
    class F {
      static v = x.at(0);
      @(x = [1, 2], (t: any, k: any) => t)
      m() {
        return 1;
      }
    }
    return F.v;
  }
  return null;
}