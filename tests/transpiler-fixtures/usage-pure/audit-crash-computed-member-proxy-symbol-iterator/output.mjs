import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// usage-pure computed-member get-iterator-method off a proxy-global-rooted Symbol.iterator key
// (`obj[globalThis.Symbol.iterator]`): the proxy-global root inside the key must be subsumed, or
// the inner identifier visitor stages a parallel rewrite overlapping the outer replacement.
// regression lock
const it = _getIteratorMethod(obj);
it;