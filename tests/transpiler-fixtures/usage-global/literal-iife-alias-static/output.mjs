import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A fixed alias may expose a static through the ordinary shared capture.
// Its original literal IIFE is evaluated once, without replaying the initializer.
const held = (() => ({
  C: Map
}))();
const {
  C: {
    groupBy
  }
} = held;
export const r = typeof groupBy;