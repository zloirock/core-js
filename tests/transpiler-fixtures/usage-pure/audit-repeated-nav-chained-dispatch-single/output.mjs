import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref;
// a dispatch CHAINED over another one memoizes the inner result, so the receiver text that holds
// the navs lives in the OUTER emission rather than in the inner transform. an inner rewrite whose
// range nests inside the already-substituted one still owes that text its render - concluding
// absorption from the enclosure alone left these reads native
_globalThis.chainBox = {
  n: 4,
  list: ['ab', 'cd']
};
// the same repetition WITHOUT the chained consumer: the receiver text stays in the single
// transform, which is the negative that pins the chaining as the discriminator
export const single = null == (_ref = (null == _globalThis.window ? void 0 : _self.chainBox.list, null == _globalThis.window ? void 0 : _self.chainBox.list)) ? void 0 : _at(_ref).call(_ref, 0);