import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A named factory retains the ordinary indirect-call extraction.
// It is not classified as a transparent literal wrapper.
function make() {
  return {
    C: Map
  };
}
const {
  C: {
    groupBy
  }
} = make();
export const r = typeof groupBy;