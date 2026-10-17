import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// the chain END sitting in CALLEE position. a POLYFILLED dispatch there owns the chain - it has
// already memoized the receiver and rebuilt the call, so a kept-nav render over its callee would
// wrap that rebuild and the invocation would lose its receiver. a PLAIN user call claims nothing,
// so the nav under it still owes its render, and both emitters must draw that line in one place
_globalThis.calleeBox = {
  list: ['ab', 'cd'],
  tag: 'box',
  fn() {
    return this && this.tag === 'box' ? 'kept' : 'LOST';
  }
};
// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref = _atMaybeArray(_ref2 = ['ab', 'cd']).call(_ref2, (null == _globalThis.window ? void 0 : _self.calleeBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref).call(_ref, 'a');