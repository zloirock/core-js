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
export function read(override) {
  function fill(target) {
    target.C = Map;
  }
  if (override) fill.apply = () => {};
  const box = {
    C: Object
  };
  fill.apply(null, [box]);
  const {
    C: {
      groupBy
    }
  } = box;
  return groupBy([7], Boolean);
}