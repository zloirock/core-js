import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a `||` whose left is a selection the build decides to a served built-in reads that built-in alone, as
// the bare built-in left does: the right never runs and injects nothing of its own
export const grouped = (typeof Symbol != 'undefined' && Map || Object).groupBy;
export const {
  from
} = typeof Symbol != 'undefined' && Array || Iterator;
export const {
  entries
} = (typeof Symbol != 'undefined' ? Object : user) || user;