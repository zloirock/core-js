import "core-js/modules/es.array.of";
// A native sibling runs before the guarded default at the pattern's edge.
// Rebinding the source in that sibling cannot change the guarded read's receiver.
let M = pickConstructor();
if (!M) M = Array;
const {
  before = (M = {}, 1),
  of: method = fallback()
} = M;
export { before, method };