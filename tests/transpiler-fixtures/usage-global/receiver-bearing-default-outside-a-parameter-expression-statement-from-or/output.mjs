import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const src = {};
function use() {/* empty */}
const {
  b1: {
    from: fromOr
  } = Array || Iterator
} = src;
use(fromOr);