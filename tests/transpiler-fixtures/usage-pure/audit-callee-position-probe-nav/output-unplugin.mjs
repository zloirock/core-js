// the chain END sitting in CALLEE position. a POLYFILLED dispatch there owns the chain - it has
// already memoized the receiver and rebuilt the call, so a kept-nav render over its callee would
// wrap that rebuild and the invocation would lose its receiver. a PLAIN user call claims nothing,
// so the nav under it still owes its render, and both emitters must draw that line in one place
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";

var _ref,
	_ref2,
	_ref3,
	_ref4,
	_ref5,
	_ref6,
	_ref7,
	_ref8;

_globalThis.calleeBox = {
	list: ['ab', 'cd'],
	tag: 'box',
	fn() {
		return this && this.tag === 'box' ? 'kept' : 'LOST';
	}
};

let heldPlain;

export const plainCall = null == (heldPlain = _globalThis).window ? void 0 : _self.calleeBox.fn();

let heldOptional;

export const optionalCall = null == (heldOptional = _globalThis).window ? void 0 : _self.calleeBox.fn?.();

let heldParen;

export const parenCallee = ((null == (heldParen = _globalThis).window ? void 0 : _self)?.calleeBox.fn)();

let heldDot;

export const dotCall = null == (heldDot = _globalThis).window
	? void 0
	: _self.calleeBox.fn.call(_globalThis.calleeBox);

export { heldPlain, heldOptional, heldParen, heldDot };

// the polyfilled dispatch over the same shapes: the render stands down and the instance channel
// owns the whole chain
let heldDispatch;

export const polyDispatch = null == (_ref = null == (heldDispatch = _globalThis).window ? void 0 : _self.calleeBox.list) ? void 0 : _at(_ref).call(_ref, 0);
export const bareDispatch = null == (_ref2 = null == _globalThis.window ? void 0 : _self.calleeBox.list) ? void 0 : _at(_ref2).call(_ref2, 0);
export const unknownDispatch = null == (_ref3 = null == _globalThis.window ? void 0 : _self.unknownCalleeBox.list) ? void 0 : _at(_ref3).call(_ref3, 0);

let heldUnknownDispatch;

export const unknownAssignDispatch = null == (_ref4 = null == (heldUnknownDispatch = _globalThis).window ? void 0 : _self.unknownCalleeBox.list) ? void 0 : _at(_ref4).call(_ref4, 0);

// a NON-optional dispatch over the same root: the `?.` on the assign carrier is dead text (the
// write always yields the global), and only one emitter drops it - a spelling split the sidecar
// records, both reading the same value through the same guard
let heldPlainDispatch;

export const plainAssignDispatch = null == (_ref5 = (heldPlainDispatch = _globalThis).window)
	? void 0
	: _at(_ref6 = _ref5.unknownCalleeBox.list).call(_ref6, 0);

export { heldDispatch, heldUnknownDispatch, heldPlainDispatch };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref7 = _atMaybeArray(_ref8 = ['ab', 'cd']).call(_ref8, (null == _globalThis.window ? void 0 : _self.calleeBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref7).call(_ref7, 'a');