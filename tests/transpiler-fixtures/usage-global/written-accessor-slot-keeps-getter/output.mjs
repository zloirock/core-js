import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A setter does not erase the getter belonging to the same property descriptor.
// Writing Map may leave the getter returning Object; keep the read and its original candidate.
// Pure guards the observed value, and global injects Object.groupBy as well as Map's statics.
const effects = [];
const source = {
  get value() {
    effects.push('get');
    return Object;
  },
  set value(ctor) {
    effects.push('set');
  }
};
source.value = Map;
export const {
  value: {
    groupBy
  }
} = source;
export { effects };