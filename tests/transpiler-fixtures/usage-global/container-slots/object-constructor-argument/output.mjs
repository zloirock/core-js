import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A new-expression argument hands the container to a constructor that writes its slot.
const escapedByNew = function () {
  function TakerShape(target) {
    if (target) target.k = Map;
  }
  const newBox = {
    k: Object
  };
  void new TakerShape(newBox);
  const {
    k: {
      entries
    }
  } = newBox;
  return entries;
}();
export { escapedByNew };