import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// a dispatch CHAINED over another one memoizes the inner result, so the receiver text that holds
// the navs lives in the OUTER emission rather than in the inner transform. an inner rewrite whose
// range nests inside the already-substituted one still owes that text its render - concluding
// absorption from the enclosure alone left these reads native
_globalThis.chainBox = {
  n: 4,
  list: ['ab', 'cd']
};
// TWO polyfilled dispatches in one guarded chain under a consumer that parenthesizes the guard: the
// wrap would otherwise reach over the OUTER dispatch's own step, ending both spans at the chain tip -
// and one range cannot hold two full replacements. the `??` is the discriminator; without it the
// spans differ on their own
export const twoDispatchesUnderNullish = (null == (_ref = null == (_ref2 = null == _globalThis.window ? void 0 : _self.chainBox.list) ? void 0 : _at(_ref2).call(_ref2, 1)) ? void 0 : _sliceMaybeArray(_ref).call(_ref, 0).length) ?? 0;