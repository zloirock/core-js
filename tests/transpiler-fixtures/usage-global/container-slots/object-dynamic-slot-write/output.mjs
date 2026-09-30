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
// An unknown write key may replace the constructor slot read by the nested pattern.
const dynamicWriteKey = function (key) {
  const dynamic = {
    k: Object
  };
  dynamic[key] = Map;
  const {
    k: {
      groupBy
    }
  } = dynamic;
  return groupBy;
}('k');
export { dynamicWriteKey };