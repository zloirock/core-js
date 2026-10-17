import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const src = {};
const flag = true;
function use() {/* empty */}
const {
  b2: {
    groupBy: groupTernary
  } = flag ? Map : Object
} = src;
use(groupTernary);