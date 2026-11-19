import "core-js/modules/es.object.is-extensible";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An optional mutator call can reposition the array element read by the nested pattern.
const repositionedByOptionalCall = function () {
  const optionalMutated = [Object, Map];
  optionalMutated?.reverse();
  const {
    0: {
      isExtensible
    }
  } = optionalMutated;
  return isExtensible;
}();
export { repositionedByOptionalCall };