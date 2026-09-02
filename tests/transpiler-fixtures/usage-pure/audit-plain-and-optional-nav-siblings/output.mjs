import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11;
// a PLAIN nav and an optional one side by side in one receiver. the plain one is collapsed by the
// accepted proxy-alias assumption while the optional one keeps its guard, so the two differ by
// exactly one token - and a composition that located the guard's slot leniently put its render on
// the plain sibling. the sequence TAIL is collapsed by the receiver render itself, so the channel
// that would claim its ponyfillable hop must stand down with it
_globalThis.siblingBox = {
  list: ['ab', 'cd']
};
export const plainFirst = null == (_ref = (_self.siblingBox.list, null == _globalThis.window ? void 0 : _self.siblingBox.list)) ? void 0 : _at(_ref).call(_ref, 0);
export const optionalFirst = null == (_ref2 = (null == _globalThis.window ? void 0 : _self.siblingBox.list, _self.siblingBox.list)) ? void 0 : _at(_ref2).call(_ref2, 0);
export const bothPlain = null == (_ref3 = (_self.siblingBox.list, _self.siblingBox.list)) ? void 0 : _at(_ref3).call(_ref3, 0);
export const bothOptional = null == (_ref4 = (null == _globalThis.window ? void 0 : _self.siblingBox?.list, null == _globalThis.window ? void 0 : _self.siblingBox.list)) ? void 0 : _at(_ref4).call(_ref4, 0);
export const prefixedPlainFirst = null == (_ref5 = ('x', _self.siblingBox.list, null == _globalThis.window ? void 0 : _self.siblingBox.list)) ? void 0 : _at(_ref5).call(_ref5, 0);
export const mixedTailOptional = null == (_ref6 = (_self.siblingBox?.list, null == _globalThis.window ? void 0 : _self.siblingBox.list)) ? void 0 : _at(_ref6).call(_ref6, 0);

// the SOURCE already spells the shape a render emits, so a slot search can meet its own output
// coming the other way. the hand-written guard is user code and must survive untouched
export const handWrittenGuardFirst = null == (_ref7 = (null == _globalThis.window ? void 0 : _self.siblingBox.list, null == _globalThis.window ? void 0 : _self.siblingBox.list)) ? void 0 : _at(_ref7).call(_ref7, 0);
export const handWrittenGuardSecond = null == (_ref8 = (null == _globalThis.window ? void 0 : _self.siblingBox.list, null == _globalThis.window ? void 0 : _self.siblingBox.list)) ? void 0 : _at(_ref8).call(_ref8, 0);
export const tripleRepeat = null == (_ref9 = (null == _globalThis.window ? void 0 : _self.siblingBox.list, null == _globalThis.window ? void 0 : _self.siblingBox.list, null == _globalThis.window ? void 0 : _self.siblingBox.list)) ? void 0 : _at(_ref9).call(_ref9, 0);

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref10 = _atMaybeArray(_ref11 = ['ab', 'cd']).call(_ref11, (null == _globalThis.window ? void 0 : _self.siblingBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref10).call(_ref10, 'a');