import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const list = [];
function use() {/* empty */}
function withDefault({
  i2: {
    includes
  } = {
    includes: _includesMaybeArray(list)
  }
} = {}) {
  return includes;
}
use(withDefault());