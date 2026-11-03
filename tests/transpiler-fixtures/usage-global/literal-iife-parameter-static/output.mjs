import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A literal IIFE used as a parameter default keeps native destructuring.
// The substituted constructor must carry its static.
function read({
  C: {
    groupBy
  }
} = (() => ({
  C: Map
}))()) {
  return typeof groupBy;
}
export const r = read();