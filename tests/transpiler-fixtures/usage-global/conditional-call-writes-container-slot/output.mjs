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
function fill(box) {
  if (box) box.C = Map;
}
export function read(flag) {
  const box = {
    C: Object
  };
  if (flag) fill(box);
  const {
    C: {
      groupBy
    }
  } = box;
  return groupBy([7], Boolean);
}