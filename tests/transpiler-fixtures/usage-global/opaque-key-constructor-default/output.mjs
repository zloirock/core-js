import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An opaque computed key keeps its nested receiver default native.
// The substituted constructor must carry the method read by the pattern.
const k = String(Math.random());
const {
  [k]: {
    groupBy
  } = Map
} = {};
export const r = groupBy([1, 2], value => value % 2).get(1)[0];