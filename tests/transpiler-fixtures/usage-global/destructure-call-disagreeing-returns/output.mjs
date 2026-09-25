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
// a callee whose returns DISAGREE pairs the slot as the union of what each return spells: pure guards
// the read against every candidate at runtime and usage-global injects the static of each. the
// returns share their static, and the Map one owes its constructor entry beside it
function pick() {
  if (flag) return {
    a: Object
  };
  return {
    a: Map
  };
}
const {
  a: viaReturns
} = pick();
export const fromReturns = viaReturns.groupBy([1], v => v);