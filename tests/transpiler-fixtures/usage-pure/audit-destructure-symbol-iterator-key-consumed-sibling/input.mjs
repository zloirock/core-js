// regression lock: a `[Symbol.iterator]` key before a consumed static sibling under a proxy-global
// receiver. the receiver memoizes to one `_ref` registered as a global alias, so the symbol key extracts
// `it = _getIteratorMethod(_ref)` AND the sibling static `from` re-polyfills off `_ref` (`const from =
// _Array$from`) - it must not stay native (undefined on ie:11). rest sentinel survives, no compose crash
const { [Symbol.iterator]: it, from, ...rest } = globalThis.Array;
it;
from([1]);
export { it, from, rest };
