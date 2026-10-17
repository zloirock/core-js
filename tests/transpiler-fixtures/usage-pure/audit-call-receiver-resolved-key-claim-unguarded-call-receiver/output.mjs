import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref;
// A CALL receiver under a computed key that RESOLVES to a method name while carrying an effect: the dispatch spells the whole span
// itself - receiver memoized behind the guard, key effect migrated out - so the global channel's claim over the nav inside it has
// nothing left to compose into.
_globalThis.claimBox = {
  list: ['ab', 'cd'],
  get: function () {
    return ['ef'];
  }
};
let k = 0;
// the same claim WITHOUT an enclosing guard keeps its own emission - the negative that pins the
// consumed-nav condition rather than the mere presence of a claim
export const unguardedCallReceiver = (_ref = _self.claimBox.get(), k++, _at(_ref).call(_ref, 0));
export { k };