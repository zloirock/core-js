import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
// a PAREN-SEALED lookup closes its own optional chain: `(recv.m?.()?.n)(args)` keeps the whole
// sealed segment in ONE memo - the inner `?.()` renders compact (`_m(recv)?.call(recv)`) and the
// `.call` rides outside the ternary, where the native throw on the void branch lives. splitting
// that segment into two guard disjuncts leaves the second one with no reader.
// the UNSEALED twin has no seal to close, so every optional in the chain hoists into one test.
// sidecar: sealing the inner CALL alone is one memo on both emitters while babel splits it in
// two - an agreed divergence, values identical
const getArr = () => [1, [2]];
export const sealedLookup = (null == (_ref = _flatMaybeArray(_ref2 = getArr())?.call(_ref2)) ? void 0 : _flatMapMaybeArray(_ref)).call(_ref, x => x);
export const sealedLookupTyped = (null == (_ref3 = _atMaybeArray(_ref4 = getArr())?.call(_ref4, 0)) ? void 0 : _toFixedMaybeNumber(_ref3)).call(_ref3, 2);
export const unsealedTwin = null == (_ref5 = _flatMaybeArray(_ref6 = getArr())) || null == (_ref7 = _ref5.call(_ref6)) ? void 0 : _flatMapMaybeArray(_ref7).call(_ref7, x => x);
export const sealedInnerCall = null == (_ref8 = _flatMaybeArray(_ref9 = getArr())?.call(_ref9)) ? void 0 : _flatMapMaybeArray(_ref8).call(_ref8, x => x);