import _getIterator from "@core-js/pure/actual/get-iterator";
// usage-pure get-iterator via a computed member whose key is an IIFE-rooted proxy-global
// Symbol.iterator (`obj[(() => globalThis)().Symbol.iterator]()`): the inner proxy global inside
// the key must be subsumed by the whole-member rewrite, or the compose crashes. regression lock
const it = _getIterator(obj);
it;