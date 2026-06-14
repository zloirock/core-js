import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// a side-effect-bearing proxy-global receiver (`(eff(), globalThis.Array)`) for a symbol-iterator +
// static-sibling destructure: the SE prefix is preserved on the memoized receiver, and the sibling static
// still re-polyfills (`from` -> the pure static) - the receiver is peeled to its runtime tail to resolve
// the ctor, so the SE wrapper doesn't hide the proxy-global member
const _ref = (eff(), _globalThis.Array);
const it = _getIteratorMethod(_ref);
const from = _Array$from;
it;
from([1]);
export { it, from };