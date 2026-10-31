// Sequence prefixes precede the realm probe, and nested key claims run only on the live branch.
// The quiet dotted control retains its existing collapse; effectful realm keys stay in the source.
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";

var _ref, _ref2;
let c = 0;
const log = [];

export const seqRootComputedHop = null == (_ref = (c++, _globalThis).window?.[(_pushMaybeArray(log).call(log, 'k'), 'self')]) ? void 0 : _nameMaybeFunction(_ref.Array);
export const seqRootDottedHop = null == (c++, _globalThis).window ? void 0 : _nameMaybeFunction(_self.Array);
export const bareRootComputedHop = null == (_ref2 = _globalThis.window?.[(_pushMaybeArray(log).call(log, 'k'), 'self')]) ? void 0 : _nameMaybeFunction(_ref2.Array);
export { c, log };