import "core-js/modules/es.object.is-sealed";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Sort may move another constructor into the index read by the nested pattern.
const repositionedBySort = function () {
  const sorted = [Object, Map];
  sorted.sort();
  const {
    0: {
      isSealed
    }
  } = sorted;
  return isSealed;
}();
export { repositionedBySort };