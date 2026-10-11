import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a key binding only an assignment gives a value holds the well-known symbol wherever the write
// reaches the read - a closure defined after it and a read in the same scope alike - so both
// reads route through the iterator-method helper
let key;
key = _Symbol$iterator;
export const read = receiver => _getIteratorMethod(receiver);
export const direct = _getIteratorMethod([1, 2]);