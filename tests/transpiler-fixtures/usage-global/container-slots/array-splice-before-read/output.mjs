import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.splice";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Splice replaces the element read by the nested pattern with another constructor.
const repositionedBySplice = function () {
  const spliced = [Object];
  spliced.splice(0, 1, Map);
  const {
    0: {
      entries
    }
  } = spliced;
  return entries;
}();
export { repositionedBySplice };