import _getIteratorMethod from "@core-js/pure/full/get-iterator-method";
import _Symbol from "@core-js/pure/full/symbol";
// The escape selects the full Symbol index. Keeping its static read must not hide
// the captured protocol key from instance dispatch, even after the realm key changes.
consume(_Symbol);
let realmKey = 'Symbol';
const Captured = _Symbol;
realmKey = 'Array';
const {
  iterator: key = fallback
} = Captured;
export const method = _getIteratorMethod([10, 11]);