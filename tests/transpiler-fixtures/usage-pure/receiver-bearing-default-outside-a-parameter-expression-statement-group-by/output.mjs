import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const src = {};
function use() {/* empty */}
const {
  e: {
    f: {
      groupBy
    } = {
      groupBy: _Map$groupBy
    }
  }
} = src;
use(groupBy);