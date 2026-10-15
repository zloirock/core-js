// A split guarded read follows an already-extracted instance slot.
// The remaining guarded siblings share the receiver even if the default rebinds its source.
// The AST drain emits those siblings as separate declarations after its queued instance read.
let M = pickConstructor();
if (!M) M = Array;
const { name: first, of: method = (M = {}, 9), from: tail } = M;
export { first, method, tail };
