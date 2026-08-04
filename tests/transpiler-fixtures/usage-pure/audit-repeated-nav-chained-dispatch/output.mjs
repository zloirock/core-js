import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref20, _ref21, _ref22, _ref23, _ref24;
// a dispatch CHAINED over another one memoizes the inner result, so the receiver text that holds
// the navs lives in the OUTER emission rather than in the inner transform. an inner rewrite whose
// range nests inside the already-substituted one still owes that text its render - concluding
// absorption from the enclosure alone left these reads native
_globalThis.chainBox = {
  n: 4,
  list: ['ab', 'cd']
};
export const chained = null == (_ref = (null == _globalThis.window ? void 0 : _self.chainBox.list, null == _globalThis.window ? void 0 : _self.chainBox.list)) ? void 0 : _includes(_ref2 = _at(_ref).call(_ref, 0)).call(_ref2, 'a');

// the same repetition WITHOUT the chained consumer: the receiver text stays in the single
// transform, which is the negative that pins the chaining as the discriminator
export const single = null == (_ref3 = (null == _globalThis.window ? void 0 : _self.chainBox.list, null == _globalThis.window ? void 0 : _self.chainBox.list)) ? void 0 : _at(_ref3).call(_ref3, 0);
export const triple = null == (_ref4 = (null == _globalThis.window ? void 0 : _self.chainBox.list, null == _globalThis.window ? void 0 : _self.chainBox.list, null == _globalThis.window ? void 0 : _self.chainBox.list)) ? void 0 : _at(_ref4).call(_ref4, 0);
export const mixedKeys = null == (_ref5 = (null == _globalThis.window ? void 0 : _self.chainBox.n, null == _globalThis.window ? void 0 : _self.chainBox.list)) ? void 0 : _at(_ref5).call(_ref5, 0);

// DEPTH: every added consumer nests one more composition level, and the ordinal that places each
// nav is recomputed at each. five levels and a four-deep ARGUMENT nesting keep that arithmetic
// pinned where a single level would not
export const deepChain = null == (_ref6 = null == (_ref7 = (null == _globalThis.window ? void 0 : _self.chainBox.list, null == _globalThis.window ? void 0 : _self.chainBox.list)) ? void 0 : _at(_ref7).call(_ref7, 0)) ? void 0 : _includes(_ref8 = _sliceMaybeArray(_ref9 = _sliceMaybeArray(_ref10 = _sliceMaybeArray(_ref6).call(_ref6, 1)).call(_ref10, 1)).call(_ref9, 1)).call(_ref8, 'a');
export const deepNest = null == (_ref11 = null == (_ref12 = null == _globalThis.window ? void 0 : _self.chainBox.list) ? void 0 : _at(_ref12).call(_ref12, 0)) ? void 0 : _includes(_ref13 = _sliceMaybeArray(_ref11).call(_ref11, (null == (_ref14 = null == (_ref15 = null == _globalThis.window ? void 0 : _self.chainBox.list) ? void 0 : _at(_ref15).call(_ref15, 1)) ? void 0 : _sliceMaybeArray(_ref14).call(_ref14, (null == (_ref16 = null == _globalThis.window ? void 0 : _self.chainBox.list) ? void 0 : _at(_ref16).call(_ref16, 0))?.length ?? 0).length) ?? 0)).call(_ref13, 'a');

// TWO polyfilled dispatches in one guarded chain under a consumer that parenthesizes the guard: the
// wrap would otherwise reach over the OUTER dispatch's own step, ending both spans at the chain tip -
// and one range cannot hold two full replacements. the `??` is the discriminator; without it the
// spans differ on their own
export const twoDispatchesUnderNullish = (null == (_ref17 = null == (_ref18 = null == _globalThis.window ? void 0 : _self.chainBox.list) ? void 0 : _at(_ref18).call(_ref18, 1)) ? void 0 : _sliceMaybeArray(_ref17).call(_ref17, 0).length) ?? 0;
export const twoDispatchesPlain = null == (_ref19 = null == (_ref20 = null == _globalThis.window ? void 0 : _self.chainBox.list) ? void 0 : _at(_ref20).call(_ref20, 1)) ? void 0 : _sliceMaybeArray(_ref19).call(_ref19, 0).length;
export const twoDispatchesOperand = 1 + ((null == (_ref21 = null == (_ref22 = null == _globalThis.window ? void 0 : _self.chainBox.list) ? void 0 : _at(_ref22).call(_ref22, 1)) ? void 0 : _sliceMaybeArray(_ref21).call(_ref21, 0).length) ?? 0);

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref23 = _atMaybeArray(_ref24 = ['ab', 'cd']).call(_ref24, (null == _globalThis.window ? void 0 : _self.chainBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref23).call(_ref23, 'a');