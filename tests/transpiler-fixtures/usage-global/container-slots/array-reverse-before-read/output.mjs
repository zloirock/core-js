import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Reverse can move another constructor into the index read by the nested pattern.
const repositionedByReverse = function () {
  const reversed = [Object, Map];
  reversed.reverse();
  const {
    0: {
      keys
    }
  } = reversed;
  return keys;
}();
export { repositionedByReverse };