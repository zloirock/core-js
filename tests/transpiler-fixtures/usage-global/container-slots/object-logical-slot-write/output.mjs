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
// A logical assignment can replace the constructor stored in the slot read by the pattern.
const assignedViaLogicalWrite = function () {
  const logical = {
    k: Object
  };
  logical.k &&= Map;
  const {
    k: {
      groupBy
    }
  } = logical;
  return groupBy;
}();
export { assignedViaLogicalWrite };