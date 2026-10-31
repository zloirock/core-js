import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// a symbol-key leaf under NESTED plain-key hops extracts through the member chain:
// the sole-binding declarator collapses to `getIteratorMethod(root.hop...)`
const it = _getIteratorMethod(obj.inner);
export { it };