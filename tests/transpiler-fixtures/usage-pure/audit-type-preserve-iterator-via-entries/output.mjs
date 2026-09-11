import _Array$from from "@core-js/pure/actual/array/from";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
// `.entries()` on Array returns Iterator. the downstream `.filter().toArray()` chain
// resolves the iterator type through type-preservation across the assign rewrite. pure
// mode does not register iterator-instance dispatch in compat data, so the chain stays
// raw beyond the `.entries()` step
const arr = _Array$from([1, 2]);
const iter = _entriesMaybeArray(arr).call(arr);
iter.filter(([, v]) => v > 0).toArray();