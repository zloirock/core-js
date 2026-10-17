import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
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
const [missArray = null == (_ref = _globalThis.window) ? void 0 : _at(_ref2 = _ref.ctorBox.list).call(_ref2, 0)] = [];
export { missArray };