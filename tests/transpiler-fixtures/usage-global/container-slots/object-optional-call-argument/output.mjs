import "core-js/modules/es.object.is-sealed";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An optional call can hand the container to a callee that writes its constructor slot.
function consume(first) {
  if (first) first.k = Map;
}
const escapedByOptionalCall = function () {
  const optionalBox = {
    k: Object
  };
  consume?.(optionalBox);
  const {
    k: {
      isSealed
    }
  } = optionalBox;
  return isSealed;
}();
export { escapedByOptionalCall };