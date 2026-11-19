import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A `||` left decides by the value it holds where the slot is read: a store yields the value it stores,
// so the right never runs; a name a conditional write may null holds no one container, so the right is
// live and its static loads beside the left's.
var stored;
function make() {
  return {
    C: Array
  };
}
export const {
  C: {
    from: viaStore
  }
} = (stored = make()) || {
  C: Iterator
};
let held = {
  C: Map
};
if (globalThis.flag) held = null;
export const {
  C: {
    groupBy: viaReachedAlias
  }
} = held || {
  C: Object
};