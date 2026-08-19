import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// a paren around the CALLEE of an optional call is grouping, not a chain terminator: it short-circuits
// exactly like the bare spelling, so the chain combine looks through it and owns the whole span. left
// to the standalone channel the span was split inside the paren token and the build failed outright.
// a paren SEALING the optional sub-chain is the opposite - there the `?.` stops short-circuiting what
// follows, and the combine must still refuse.
const arr = [[1]];
const box = {
  pick: () => arr
};
export const parenCalleeThenCall = null == (_ref = _flatMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, 0);
export const doubleParenCallee = null == (_ref3 = _flatMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref4 = _ref3.call(arr)).call(_ref4, 0);
export const parenCalleeThenGet = null == (_ref5 = _flatMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref5.call(arr));
export const parenCalleeAlone = _flatMaybeArray(arr)?.call(arr);
// NEGATIVE: the paren seals the optional sub-chain, so the tail reads the sealed value
export const sealedSubChain = _includesMaybeArray(_ref6 = _flatMaybeArray(arr)?.call(arr)).call(_ref6, 1);
// NEGATIVE: a non-polyfillable callee under the same parens
export const nonPolyParenCallee = null == (_ref7 = box.pick) ? void 0 : _atMaybeArray(_ref8 = _ref7.call(box)).call(_ref8, 0);