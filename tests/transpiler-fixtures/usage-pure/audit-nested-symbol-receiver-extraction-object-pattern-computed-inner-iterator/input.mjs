// a symbol-key leaf under NESTED plain-key hops extracts through the member chain:
// the sole-binding declarator collapses to `getIteratorMethod(root.hop...)`
const { inner: { [Symbol.iterator]: it } } = obj;
export { it };
