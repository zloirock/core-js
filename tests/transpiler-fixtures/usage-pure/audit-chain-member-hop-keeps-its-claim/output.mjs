import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13;
// an intermediate MEMBER hop inside a combined chain is a claim of its own: the combine skips that
// hop's dispatch, so re-emitting its source verbatim drops the polyfill with no diagnostic. the hop
// resolves through the same canon a call hop uses and renders as a bare helper read - one evaluation,
// no receiver memo, because a GET binds no `this`.
const arr = [[[1]]];
const k = 'flat';
const effects = [];
const eff = t => {
  _pushMaybeArray(effects).call(effects, t);
  return t;
};
const dyn = String(Math.min(1, 2)) === '1' ? 'length' : 'at';
export const memberHopUnderGetTail = null == (_ref = _atMaybeArray(arr)) ? void 0 : _nameMaybeFunction(_flatMaybeArray(_ref.call(arr, 0)));
export const memberHopMirrored = null == (_ref2 = _flatMaybeArray(arr)) ? void 0 : _nameMaybeFunction(_atMaybeArray(_ref2.call(arr, 0)));
export const memberHopUnderCallTail = null == (_ref3 = _atMaybeArray(arr)) ? void 0 : _at(_ref4 = _flatMaybeArray(_ref3.call(arr, 0))).call(_ref4, 0);
export const computedMemberHop = null == (_ref5 = _atMaybeArray(arr)) ? void 0 : _nameMaybeFunction(_flatMaybeArray(_ref5.call(arr, 0)));
// a folded computed key on the hop reads AFTER the receiver and BEFORE the hop above it, which is
// what the memo orders - the effects are otherwise emitted in the reverse of source order
export const seKeyHop = null == (_ref6 = _atMaybeArray(arr)) ? void 0 : _nameMaybeFunction((_ref7 = _ref6.call(arr, 0), eff('k'), _flatMaybeArray(_ref7)));
export const seKeyBothHops = null == (_ref8 = _atMaybeArray(arr)) ? void 0 : _at(_ref9 = (_ref10 = (_ref11 = _ref8.call(arr, 0), eff('k'), _flatMaybeArray(_ref11)), eff('o'), _nameMaybeFunction(_ref10))).call(_ref9, 0);
// NEGATIVE: a hop whose key does not resolve keeps its verbatim source
export const unresolvedKeyHop = null == (_ref12 = _atMaybeArray(arr)) ? void 0 : _nameMaybeFunction(_ref12.call(arr, 0)[dyn]);
// NEGATIVE: a non-claim tail builds no combine, so the hop is left to its own dispatch
export const nonClaimTail = null == (_ref13 = _atMaybeArray(arr)) ? void 0 : _flatMaybeArray(_ref13.call(arr, 0)).call(_atMaybeArray(arr).call(arr, 0));