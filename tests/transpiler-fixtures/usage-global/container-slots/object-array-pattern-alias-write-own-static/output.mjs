import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.group-by";
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
// a constructor written through an array pattern's alias of a container lands in that container's slot: a
// read of the slot loads the written constructor's own static (`Map.groupBy`) beside the initial value's
const groupedByArrayPatternAlias = function () {
  const patBox = {
    k: Object
  };
  const [reHomed] = [patBox];
  reHomed.k = Map;
  const {
    k: {
      groupBy
    }
  } = patBox;
  return groupBy([1, 2], x => x % 2);
}();
export { groupedByArrayPatternAlias };