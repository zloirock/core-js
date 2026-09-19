import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3;
// A receiver read once by an instance helper stays inline, even when a folded realm hop
// carries a root effect. A later key effect still needs its receiver captured before it;
// calls binding this and optional accesses keep the memo their second receiver read needs.
// usage-global has no receiver rendering, so no import-set twin can distinguish this claim.
let seq = 0;
export const plainRead = _nameMaybeFunction((seq++, _globalThis).Array);
export const simpleCall = _getIterator((seq++, _globalThis).Array.prototype);
const box = {
  get list() {
    seq++;
    return [1, 2];
  }
};
export const keyedRead = (_ref = box.list, seq++, _atMaybeArray(_ref));
export const methodCall = _includesMaybeArray(_ref2 = box.list).call(_ref2, 2);
export const guardedRead = null == (_ref3 = box.list) ? void 0 : _findLastMaybeArray(_ref3);
export { seq };