import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// a `?.()` that IS the receiver's root segment memoizes AS WRITTEN - the sole short-circuit
// is the callee value itself, so the memo carries the source spelling and the dispatch
// guards on it (no disjunct unfold). an ARGFUL callee memoizes through a ref (the claim
// must not drop to raw - the bail here once lost the polyfill outright)
export const r1 = null == (_ref = getArr?.()) ? void 0 : _flatMaybeArray(_ref).call(_ref);
export const r2 = null == (_ref2 = box.get?.()) ? void 0 : _flatMaybeArray(_ref2).call(_ref2);
export const r3 = null == (_ref3 = box.inner.get?.()) ? void 0 : _flatMaybeArray(_ref3).call(_ref3);
export const r4 = null == (_ref4 = pick(1)?.()) ? void 0 : _flatMaybeArray(_ref4).call(_ref4);
export const r5 = null == (_ref5 = pick(2)) ? void 0 : _flatMaybeArray(_ref6 = _ref5())?.call(_ref6);
// a REWRITTEN dispatch callee still threads its disjuncts (its guard joins the chain)
export const r6 = null == (_ref7 = _flatMaybeArray(arr)) || null == (_ref8 = _ref7.call(arr)) ? void 0 : _flatMaybeArray(_ref8).call(_ref8);
use(r1, r2, r3, r4, r5, r6);