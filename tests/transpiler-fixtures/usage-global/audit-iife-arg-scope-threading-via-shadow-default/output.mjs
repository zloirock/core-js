import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// a param SHADOWING the arg's name must not swallow the receiver (param-default arm)
export const viaShadowDefault = !function ({
  of
} = WeakMap, Array) {
  return of;
}(Array);