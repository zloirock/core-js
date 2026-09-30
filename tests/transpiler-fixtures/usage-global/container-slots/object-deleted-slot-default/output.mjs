import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Deleting the constructor slot leaves the nested pattern to its own empty-object default.
const deletedSlot = function () {
  const dropped = {
    k: Object
  };
  delete dropped.k;
  const {
    k: {
      groupBy
    } = {}
  } = dropped;
  return groupBy;
}();
export { deletedSlot };