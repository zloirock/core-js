// a paren layer sits BETWEEN the probe nav and its tail. the guard's own parens ARE that layer's
// once the render absorbs it, so every step above reads off the guarded value from OUTSIDE them:
// none of it may be folded in, and the tail keeps the source's PLAIN dereference - which throws
// where the guard answers nullish, exactly as the source does
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";

var _ref, _ref2, _ref3, _ref4;

_globalThis.parenBox = { list: ['ab', 'cd'], n: 7 };

export const parenNavDispatch = null == (_ref = (null == _globalThis.window ? void 0 : _self.parenBox).list) ? void 0 : _at(_ref).call(_ref, 0);
export const parenNavPlain = (null == _globalThis.window ? void 0 : _self.parenBox).list;
export const parenNavDeep = (null == _globalThis.window ? void 0 : _self.parenBox.list).length;
export const parenNavOptionalTail = (null == _globalThis.window ? void 0 : _self.parenBox)?.list;

// the parens around the WHOLE chain leave nothing between the nav and its tail, so the fold
// applies there as it always did - the negative that pins the absorbed layer as the discriminator
export const parenWholeChain = null == (_ref2 = null == _globalThis.window ? void 0 : _self.parenBox.list) ? void 0 : _at(_ref2).call(_ref2, 0);

export const parenLeafOnly = (null == _globalThis.window ? void 0 : _self).parenBox.n;

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref3 = _atMaybeArray(_ref4 = ['ab', 'cd']).call(_ref4, (null == _globalThis.window ? void 0 : _self.parenBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref3).call(_ref3, 'a');

// the CONSUMER above the absorbed layer decides whether the fold owes it parens, so the slots that
// delimit an expression and the slots that swallow one are both asked here
export const layerTypeof = typeof (null == _globalThis.window ? void 0 : _self.parenBox).list;

export const layerCarrier = (null == _globalThis.window ? void 0 : _self.parenBox)?.list ?? ['fallback'];

export const layerSpread = [
	...(null == _globalThis.window ? void 0 : _self.parenBox)?.list ?? []
];

export const layerOperand = 1 + ((null == _globalThis.window ? void 0 : _self.parenBox)?.list?.length ?? 0);
export const layerTernaryTest = (null == _globalThis.window ? void 0 : _self.parenBox)?.list ? 'y' : 'n';