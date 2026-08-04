import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10;
// a CHAINED consumer above the dispatch makes the outer emission re-spell the receiver, so the nav
// inside it is rendered by the hop-collapse channel rather than by the receiver render. the two
// spellings are equivalent - the guarded value is nullish on exactly the same branch, and both
// dereference it plainly afterwards - so the emitters differ in SHAPE here and the sidecar records
// which one each produces
_globalThis.chainLayerBox = { n: 4, list: ['ab', 'cd'] };
export const chained = null == (_ref = ((null == _globalThis.window ? void 0 : _self)?.chainLayerBox).list) ? void 0 : _includes(_ref2 = _at(_ref).call(_ref, 0)).call(_ref2, 'a');
export const chainedTwice = null == (_ref3 = ((null == _globalThis.window ? void 0 : _self)?.chainLayerBox).list) ? void 0 : _includes(_ref4 = _includes(_ref5 = _at(_ref3).call(_ref3, 0)).call(_ref5, 'a')).call(_ref4, 'a');

// the same layer WITHOUT a chained consumer keeps both emitters on the receiver render, which folds
// the plain hop into the alternate - the negative that pins the chaining as the discriminator
export const unchained = null == (_ref6 = (null == _globalThis.window ? void 0 : _self.chainLayerBox).list) ? void 0 : _at(_ref6).call(_ref6, 0);
export const unchainedPlain = _at(_ref7 = (null == _globalThis.window ? void 0 : _self.chainLayerBox).list).call(_ref7, 0);
export const unchainedCarrier = (null == (_ref8 = (null == _globalThis.window ? void 0 : _self.chainLayerBox).list) ? void 0 : _at(_ref8).call(_ref8, 0)) ?? [];

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref9 = _atMaybeArray(_ref10 = ['ab', 'cd']).call(_ref10, (null == _globalThis.window ? void 0 : _self.chainLayerBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref9).call(_ref9, 'a');