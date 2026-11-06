import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5;
// a dispatch CHAINED over another one memoizes the inner result, so the receiver text that holds
// the navs lives in the OUTER emission rather than in the inner transform. an inner rewrite whose
// range nests inside the already-substituted one still owes that text its render - concluding
// absorption from the enclosure alone left these reads native
_globalThis.chainBox = {
  n: 4,
  list: ['ab', 'cd']
};
// DEPTH: every added consumer nests one more composition level, and the ordinal that places each
// nav is recomputed at each. five levels and a four-deep ARGUMENT nesting keep that arithmetic
// pinned where a single level would not
export const deepChain = null == (_ref = null == (_ref2 = (null == _globalThis.window ? void 0 : _self.chainBox.list, null == _globalThis.window ? void 0 : _self.chainBox.list)) ? void 0 : _at(_ref2).call(_ref2, 0)) ? void 0 : _includes(_ref3 = _sliceMaybeArray(_ref4 = _sliceMaybeArray(_ref5 = _sliceMaybeArray(_ref).call(_ref, 1)).call(_ref5, 1)).call(_ref4, 1)).call(_ref3, 'a');