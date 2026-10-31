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
// Unshift changes which constructor occupies the index read by the nested pattern.
const repositionedByUnshift = function () {
  const shifted = [Object];
  shifted.unshift(Map);
  const {
    0: {
      groupBy
    }
  } = shifted;
  return groupBy;
}();
export { repositionedByUnshift };