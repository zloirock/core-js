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
// The flat guarded residual keeps its prefix and receiver read together, once.
export let r;
export const effects = [];
function record(value) {
  effects[effects.length] = value;
}
class Box {
  static get value() {
    record('get');
    return globalThis;
  }
}
const {
  groupBy,
  other
} = (record('prefix'), Box.value.Map);
r = [typeof groupBy, typeof other];