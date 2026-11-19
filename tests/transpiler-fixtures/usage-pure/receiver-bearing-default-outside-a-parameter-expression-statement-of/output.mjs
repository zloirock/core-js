import _Array$of from "@core-js/pure/actual/array/of";
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
function use() {/* empty */}
const {
  Array: {
    of
  }
} = {
  Array: {
    of: _Array$of
  }
};
use(of);