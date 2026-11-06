import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested default owns its literal slot even outside an open parameter.
function read(source) {
  const {
    W: {
      C: {
        groupBy
      }
    } = {
      C: globalThis.Map
    }
  } = source;
  return groupBy;
}
use(read({}));