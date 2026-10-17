import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
// two surfaces the probe-nav corpus had never covered: CONSTRUCT positions (the parenthesized
// callee of `new`, a class heritage clause, a `super` static call) and PATTERN defaults (object /
// array / nested / parameter). the nav's value survives into each of them, so the guard render
// has to reach them exactly as it reaches an ordinary receiver
_globalThis.ctorBox = {
  Ctor: class {
    constructor(v) {
      this.k = v ?? 'c';
    }
  },
  list: ['ab', 'cd'],
  n: 4
};
function withParamDefault({
  missParam = (() => {
    var _ref;
    return null == (_ref = null == _globalThis.window ? void 0 : _self.ctorBox.list) ? void 0 : _at(_ref).call(_ref, 0);
  })()
} = {}) {
  return missParam;
}
export const paramDefault = withParamDefault();