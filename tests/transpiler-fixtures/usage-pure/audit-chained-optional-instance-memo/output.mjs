import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _replaceAllMaybeString from "@core-js/pure/actual/string/instance/replace-all";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19;
// two OPTIONAL polyfilled dispatches in a row: the outer memoizes the whole inner call as its
// root, so the inner's emit has to land in that memo's VALUE slot. once a nested rewrite has
// already reshaped the slot no source-derived needle survives there, and the fallback shape -
// the bare guard ref - matches the memo's own LHS instead, spelling an assignment TO the emit
// (output that does not parse at all)
_globalThis.chainBox = {
  list: ['ab', 'cd'],
  str: 'a-a'
};
export const flatThenAt = null == (_ref = null == (_ref2 = _globalThis.chainBox.list) ? void 0 : _at(_ref2).call(_ref2, 0)) ? void 0 : _at(_ref).call(_ref, 0);
export const replaceThenAt = null == (_ref3 = null == (_ref4 = _globalThis.chainBox.str) ? void 0 : _replaceAllMaybeString(_ref4).call(_ref4, 'a', 'z')) ? void 0 : _at(_ref3).call(_ref3, 0);
export const overNav = null == (_ref5 = null == (_ref6 = null == _globalThis.window ? void 0 : _self.chainBox.list) ? void 0 : _at(_ref6).call(_ref6, 0)) ? void 0 : _at(_ref5).call(_ref5, 0);
export const threeDeep = null == (_ref7 = null == (_ref8 = null == (_ref9 = _globalThis.chainBox.list) ? void 0 : _at(_ref9).call(_ref9, 0)) ? void 0 : _sliceMaybeArray(_ref8).call(_ref8, 0, 2)) ? void 0 : _at(_ref7).call(_ref7, 0);

// the negatives that pin which shape needs the fallback: a MEMBER tail past the first dispatch
// keeps a needle of its own, a non-optional second dispatch never memoizes, and a LOCAL receiver
// leaves the raw source in place for the plain needle to find
export const flatThenLength = (null == (_ref10 = _globalThis.chainBox.list) ? void 0 : _at(_ref10).call(_ref10, 0))?.length;
export const flatThenPlainAt = null == (_ref11 = _globalThis.chainBox.list) ? void 0 : _at(_ref12 = _at(_ref11).call(_ref11, 0)).call(_ref12, 0);
const localArr = [3, [1, 2]];
export const localChain = null == (_ref13 = localArr == null ? void 0 : _atMaybeArray(localArr).call(localArr, 0)) ? void 0 : _at(_ref13).call(_ref13, 0);

// the same chain over a tail name this file never writes: the suppressed-hop render drive sees a
// chain END that is a dispatch CALLEE there, and rendering over it wraps the rebuilt call instead
// of the receiver - the invocation would lose its receiver and throw
export const overNavUnknown = null == (_ref14 = null == (_ref15 = null == _globalThis.window ? void 0 : _self.unknownChain.list) ? void 0 : _at(_ref15).call(_ref15, 0)) ? void 0 : _at(_ref14).call(_ref14, 0);
export const overNavUnknownDeep = null == (_ref16 = null == (_ref17 = null == _globalThis.window ? void 0 : _self.unknownChain.inner.list) ? void 0 : _at(_ref17).call(_ref17, 0)) ? void 0 : _at(_ref16).call(_ref16, 0);

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref18 = _atMaybeArray(_ref19 = ['ab', 'cd']).call(_ref19, (null == _globalThis.window ? void 0 : _self.chainBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref18).call(_ref18, 'a');