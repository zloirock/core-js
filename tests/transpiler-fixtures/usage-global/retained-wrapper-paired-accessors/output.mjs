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
// The retained pattern reads the constructor static from its literal slot.
// Computed keys, accessors and overrides keep their native evaluation order.
export const effects = [];
const {
  w: {
    groupBy
  }
} = {
  get w() {
    effects.push('get');
    return Map;
  },
  set w(value) {
    effects.push('set');
  }
};
export const r = groupBy([1, 2, 3], value => value % 2);