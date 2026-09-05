import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _replaceAllMaybeString from "@core-js/pure/actual/string/instance/replace-all";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11;
// an OPTIONAL instance dispatch memoizes its receiver, and when that receiver IS the guarded nav
// the memo must hold the RENDERED text. taking the raw source there left the whole nav
// unrewritten - a bare `globalThis` (ReferenceError on the oldest target) and a native `self`
// where the ponyfill belongs, while the guard around the probe vanished entirely
_globalThis.navBox = {
  list: ['ab', 'cd'],
  str: 'a-a',
  nested: {
    list: [5, [6]]
  }
};
export const flatOptional = null == (_ref = null == _globalThis.window ? void 0 : _self.navBox.list) ? void 0 : _at(_ref).call(_ref, 0);
export const atOptional = null == (_ref2 = null == _globalThis.window ? void 0 : _self.navBox.list) ? void 0 : _at(_ref2).call(_ref2, 0);
const nr = () => _globalThis;
export const callRootOptional = null == (_ref3 = null == nr().window ? void 0 : _self.navBox.list) ? void 0 : _at(_ref3).call(_ref3, 0);
export const hopOptional = null == (_ref4 = null == _globalThis.window ? void 0 : _self.navBox?.list) ? void 0 : _at(_ref4).call(_ref4, 0);
export const deepOptional = null == (_ref5 = null == _globalThis.window ? void 0 : _self.navBox.nested.list) ? void 0 : _at(_ref5).call(_ref5, 0);

// the NON-optional dispatch memoizes the probe instead and stitches its tail off the ref - the
// negative that pins which receiver the memo actually holds
export const flatPlain = null == (_ref6 = _globalThis.window) ? void 0 : _at(_ref7 = _ref6.navBox.list).call(_ref7, 0);
export const replacePlain = null == (_ref8 = _globalThis.window) ? void 0 : _replaceAllMaybeString(_ref9 = _ref8.navBox.str).call(_ref9, 'a', 'z');

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref10 = _atMaybeArray(_ref11 = ['ab', 'cd']).call(_ref11, (null == _globalThis.window ? void 0 : _self.navBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref10).call(_ref10, 'a');