// usage-pure OPTIONAL computed-member get-iterator-method off a proxy-global-rooted Symbol.iterator
// key (`obj?.[globalThis.Symbol.iterator]`). the `?.` lowers to a null-guarded conditional while
// the proxy-global root inside the key must still be subsumed, or the inner identifier visitor
// stages a parallel rewrite overlapping the outer replacement. regression lock
const it = obj?.[globalThis.Symbol.iterator];
it;
