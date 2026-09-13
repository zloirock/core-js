import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// A sequence around a kept assignment preserves the store and its preceding effect once.
// The following constructor or static read still selects its pure binding, and any polyfill
// inside the sequence remains rewritten. A name read needs no second receiver evaluation.
const arr = [1];
let t;
export const seqAroundGuard = _nameMaybeFunction((_atMaybeArray(arr).call(arr, 0), t = _self, _Map));
export const seqAroundStatic = (_atMaybeArray(arr).call(arr, 0), t = _self, _Number$MAX_SAFE_INTEGER);
export const seqAroundTail = _nameMaybeFunction((_atMaybeArray(arr).call(arr, 0), t = _self, _Map));
// A live optional tail probes and stores the terminal window value instead of a collapsed realm.
export const seqAroundGuardTail = null == (_atMaybeArray(arr).call(arr, 0), t = _self.window) ? void 0 : _nameMaybeFunction(_Map);
// Both wrapped and bare optional constructor reads preserve the same terminal stored value
// and keep the source guard when that value can be undefined.
export const seqAroundGuardCtor = null == (_atMaybeArray(arr).call(arr, 0), t = _self.window) ? void 0 : _Map;
export const bareGuardCtor = null == (t = _self.window) ? void 0 : _Map;

// An alias root follows the same navigation rules. A for-of receiver also preserves the
// sequence effect and store before invoking the selected static.
const galias = _globalThis;
export const aliasSeqAround = (_atMaybeArray(arr).call(arr, 0), t = _self, _Number$MAX_SAFE_INTEGER);
export const forInit = (() => {
  const out = [];
  for (const x of (_atMaybeArray(arr).call(arr, 0), t = _self, _Array$of)(7)) _pushMaybeArray(out).call(out, x);
  return out;
})();