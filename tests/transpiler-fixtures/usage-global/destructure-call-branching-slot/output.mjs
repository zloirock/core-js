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
// a BRANCHING slot of the literal a call yields holds either arm: pure guards the read against each
// at runtime and usage-global injects the static of each. the arms share their static, and the Map
// arm owes its constructor entry beside it
const either = () => ({
  a: flag ? Object : Map
});
const {
  a: viaBranching
} = either();
export const fromBranching = viaBranching.groupBy([1], v => v);