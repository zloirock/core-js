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
// a BRANCHING container value reaches EVERY arm: the container walk enumerates the arms of a
// ternary or a logical exactly as the bare-alias axis already does, so a hop spelling answers
// what the alias spelling answers at the same reachability. each line picks a static only ONE
// arm carries, so its import can only come from the enumerated arm; distinct method per line.
const c = Math.random() > 0.5;
// branching between container ALIASES
const nsLeft = {
  Base: Object
};
const nsRight = {
  Base: Map
};
const aliasBranch = c ? nsLeft : nsRight;
export const viaAlias = aliasBranch.Base.groupBy([], x => x);