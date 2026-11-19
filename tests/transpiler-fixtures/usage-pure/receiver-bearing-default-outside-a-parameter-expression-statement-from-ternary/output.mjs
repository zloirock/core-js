import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const src = {};
const flag = true;
function use() {/* empty */}
const {
  b2: {
    from: fromTernary
  } = flag ? {
    from: _Array$from
  } : {
    from: _Iterator$from
  }
} = src;
use(fromTernary);