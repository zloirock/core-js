import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// a zero-arg IIFE-return proxy-global receiver (`(() => globalThis.Array)()`) for a symbol-iterator +
// static-sibling destructure: the receiver is peeled to its runtime proxy-global member so the sibling
// static still re-polyfills (`of` -> the pure static) - without the peel the sibling stays native
// (undefined on ie:11). same canonical receiver-normalization the SE / hop receiver shapes use
const _ref = (() => _globalThis.Array)();
const it = _getIteratorMethod(_ref);
const of = _Array$of;
it;
of(1, 2);
export { it, of };