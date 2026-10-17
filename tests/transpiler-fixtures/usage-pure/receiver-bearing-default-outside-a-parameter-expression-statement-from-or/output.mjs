import _Array$from from "@core-js/pure/actual/array/from";
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const src = {};
function use() {/* empty */}
const {
  b1: {
    from: fromOr
  } = {
    from: _Array$from
  }
} = src;
use(fromOr);