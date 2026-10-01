import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A local callee receives the container and writes its constructor slot before the nested read.
function poisonContainer(target) {
  target.k = Map;
}
const closureWrite = function () {
  const closed = {
    k: Object
  };
  poisonContainer(closed);
  const {
    k: {
      entries
    }
  } = closed;
  return entries;
}();
export { closureWrite };