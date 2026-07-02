import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the destructure key is COMPUTED through a const alias (`const k = "x"; const { [k]: A } = ...`).
// the resolver follows the same key canon the read side uses to pair the slot, so the value alias
// resolves - in declarations AND in reassignments
const k = "x";
const {
  [k]: A
} = {
  x: Map
};
A.groupBy([], x => x);
const j = "y";
let B;
({
  [j]: B
} = {
  y: Object
});
B.fromEntries([["k", 1]]);