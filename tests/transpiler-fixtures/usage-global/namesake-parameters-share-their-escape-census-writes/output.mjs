import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the escape census files a slot write under the name written through, so a parameter shares the writes of
// a namesake parameter of another function: `fill` never takes `listed`, yet the unknown-key read through the
// parameter `keep` stores loads `Map`'s statics
function fill(box) {
  box.C = Map;
}
const listed = {
  C: Boolean
};
let held;
function keep(box) {
  held = box;
}
keep(listed);
export const kept = held.C[key]([1], x => x);