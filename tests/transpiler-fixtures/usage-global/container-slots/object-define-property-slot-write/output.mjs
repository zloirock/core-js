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
// Object.defineProperty receives the container and replaces its constructor slot.
const assignedViaDefineProperty = function () {
  const defined = {
    k: Object
  };
  Object.defineProperty(defined, 'k', {
    value: Map
  });
  const {
    k: {
      groupBy
    }
  } = defined;
  return groupBy;
}();
export { assignedViaDefineProperty };