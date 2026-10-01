import "core-js/modules/es.object.is-frozen";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An argument selected from an inline object still hands the contained container to the callee.
function consume(first) {
  if (first) first.k = Map;
}
const escapedInsideObjectValue = function () {
  const objBox = {
    k: Object
  };
  consume({
    inner: objBox
  }.inner);
  const {
    k: {
      isFrozen
    }
  } = objBox;
  return isFrozen;
}();
export { escapedInsideObjectValue };