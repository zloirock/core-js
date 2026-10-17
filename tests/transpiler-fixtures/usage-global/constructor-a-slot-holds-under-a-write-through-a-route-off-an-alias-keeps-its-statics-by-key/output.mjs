import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a write through a selection or a member path starting off a plain alias of a container lands on the container
// all the same - an arm holding the alias, a chain of selections ending at it, a path off it - so the constructor
// the literal held there keeps its statics, read back off the container or off the alias; a write under another
// key through such an arm leaves the literal's constructor to the read
const grouped = {
  C: Map
};
const alias = grouped;
const spare = {};
const via = flag ? alias : spare;
via.C = userValue;
export const byKey = grouped.C.groupBy([1], x => x);