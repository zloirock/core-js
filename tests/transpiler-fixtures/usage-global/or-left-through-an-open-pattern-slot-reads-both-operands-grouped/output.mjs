import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a `||` / `??` or a presence test whose left reads a name a pattern binds to a slot holding no one certain
// value - one a write replaced or a call it escapes to may replace, one a spread may shift, one of a
// container a write may replace, and an alias of such a name - decides nothing: the slot may hold a falsy
// value, so the right is read too. a slot captured before its write, and one nothing writes, decide
const box = {
  C: Map
};
box.C = null;
const {
  C: M
} = box;
export const grouped = (M || Object).groupBy;