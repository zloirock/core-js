import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
function realm() {
  return globalThis;
}
function opaque() {
  return {
    Array: {
      of() {
        return 'custom';
      }
    }
  };
}
// A constructor with a pure entry keeps its statics: the read off the selection is a held slot.
export function ctorStatic(flag) {
  return (flag ? realm() : opaque()).Map.groupBy([1, 2], value => value % 2);
}