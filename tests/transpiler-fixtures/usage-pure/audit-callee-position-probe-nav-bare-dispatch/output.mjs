import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref;
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
export const bareDispatch = null == (_ref = null == _globalThis.window ? void 0 : _self.calleeBox.list) ? void 0 : _at(_ref).call(_ref, 0);