// usage-pure computed-member get-iterator-method whose Symbol.iterator key is rooted on the
// `self` proxy-global (`obj[self.Symbol.iterator]`), not `globalThis`. the proxy-global root in
// the key must be subsumed, or the inner identifier visitor stages a parallel rewrite overlapping
// the outer replacement. regression lock
const it = obj[self.Symbol.iterator];
it;
