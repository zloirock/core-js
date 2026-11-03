import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A parameter pattern keeps the default behind an opaque computed key.
// Its substituted constructor must carry the static.
function read({
  [String(Math.random())]: {
    groupBy
  } = Map
}) {
  return groupBy([1], value => value).get(1)[0];
}
export const r = read({});