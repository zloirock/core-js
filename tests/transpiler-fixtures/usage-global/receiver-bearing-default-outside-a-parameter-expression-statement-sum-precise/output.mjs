import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.math.sum-precise";
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const src = {};
function use() {/* empty */}
const {
  e: {
    f: {
      sumPrecise
    } = Math
  }
} = src;
use(sumPrecise);