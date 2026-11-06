// `.entries()` on Array returns Iterator. the downstream `.filter().toArray()` chain
// resolves the iterator type through type-preservation across the assign rewrite. pure
// mode does not register iterator-instance dispatch in compat data, so the chain stays
// raw beyond the `.entries()` step
const arr = Array.from([1, 2]);
const iter = arr.entries();
iter.filter(([, v]) => v > 0).toArray();
