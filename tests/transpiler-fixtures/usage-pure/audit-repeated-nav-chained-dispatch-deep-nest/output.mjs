import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// a dispatch CHAINED over another one memoizes the inner result, so the receiver text that holds
// the navs lives in the OUTER emission rather than in the inner transform. an inner rewrite whose
// range nests inside the already-substituted one still owes that text its render - concluding
// absorption from the enclosure alone left these reads native
_globalThis.chainBox = {
  n: 4,
  list: ['ab', 'cd']
};
export const deepNest = null == (_ref = null == (_ref2 = null == _globalThis.window ? void 0 : _self.chainBox.list) ? void 0 : _at(_ref2).call(_ref2, 0)) ? void 0 : _includes(_ref3 = _sliceMaybeArray(_ref).call(_ref, (null == (_ref4 = null == (_ref5 = null == _globalThis.window ? void 0 : _self.chainBox.list) ? void 0 : _at(_ref5).call(_ref5, 1)) ? void 0 : _sliceMaybeArray(_ref4).call(_ref4, (null == (_ref6 = null == _globalThis.window ? void 0 : _self.chainBox.list) ? void 0 : _at(_ref6).call(_ref6, 0))?.length ?? 0).length) ?? 0)).call(_ref3, 'a');