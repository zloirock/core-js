import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A literal returned by a transparent IIFE keeps the assignment pattern.
// The substituted constructor must carry its static.
let groupBy;
({
  C: {
    groupBy
  }
} = (() => ({
  C: Map
}))());
export const r = typeof groupBy;