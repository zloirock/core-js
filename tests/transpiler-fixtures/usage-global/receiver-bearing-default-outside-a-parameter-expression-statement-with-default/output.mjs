import "core-js/modules/es.array.includes";
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const list = [];
function use() {/* empty */}
function withDefault({
  i2: {
    includes
  } = list
} = {}) {
  return includes;
}
use(withDefault());