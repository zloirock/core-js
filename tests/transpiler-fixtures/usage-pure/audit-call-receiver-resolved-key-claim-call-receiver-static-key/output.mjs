import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// A CALL receiver under a computed key that RESOLVES to a method name while carrying an effect: the dispatch spells the whole span
// itself - receiver memoized behind the guard, key effect migrated out - so the global channel's claim over the nav inside it has
// nothing left to compose into.
_globalThis.claimBox = {
  list: ['ab', 'cd'],
  get: function () {
    return ['ef'];
  }
};
export const callReceiverStaticKey = null == (_ref = _globalThis.window) ? void 0 : _at(_ref2 = _ref.claimBox.get()).call(_ref2, 0);