import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An assignment pattern keeps the default behind an opaque computed key.
// Its substituted constructor must carry the static.
let groupBy;
({
  [String(Math.random())]: {
    groupBy
  } = Map
} = {});
export const r = groupBy([1], value => value).get(1)[0];