import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An argument selected from an inline array still hands the contained object to the callee.
function consume(first) {
  if (first) first.k = Map;
}
const escapedInsideArrayLiteral = function () {
  const litBox = {
    k: Object
  };
  consume([litBox][0]);
  const {
    k: {
      getOwnPropertyNames
    }
  } = litBox;
  return getOwnPropertyNames;
}();
export { escapedInsideArrayLiteral };