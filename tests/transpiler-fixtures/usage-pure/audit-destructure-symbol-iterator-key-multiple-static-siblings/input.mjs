// generalization of the symbol-iterator-key + consumed-static-sibling lock to MULTIPLE statics: every
// sibling static off the proxy-global ctor extracts to its polyfill (`from`, `of`), each key renamed to a
// throwaway, while the symbol key extracts `it = _getIteratorMethod(_ref)`. the memoized `_ref` is
// registered as a global alias so all siblings re-polyfill off it - none stay native (undefined on ie:11)
const { [Symbol.iterator]: it, from, of, ...rest } = globalThis.Array;
it;
from([1]);
of(2, 3);
export { it, from, of, rest };
