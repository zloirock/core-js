import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5;
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
export const newCallee = new (null == _globalThis.window ? void 0 : _self.ctorBox.Ctor)('x').k;
let heldNew;
export const newCalleeAssignRoot = new (null == (heldNew = _globalThis).window ? void 0 : _self.ctorBox.Ctor)('y').k;
class Extended extends (null == _globalThis.window ? void 0 : _self.ctorBox.Ctor) {}
export const heritage = new Extended().k;
class WithSuper extends Array {
  static make() {
    return _Array$of.call(this, null == _globalThis.window ? void 0 : _self.ctorBox.n);
  }
}
export const superStatic = WithSuper.make().length;
export { heldNew };

// pattern defaults: the nav only evaluates on the ABSENT path, so its guard must sit inside the
// default rather than around the destructuring
const {
  missObject = null == _globalThis.window ? void 0 : _self.ctorBox.n
} = {};
const [missArray = null == (_ref = _globalThis.window) ? void 0 : _at(_ref2 = _ref.ctorBox.list).call(_ref2, 0)] = [];
const {
  deep: {
    missNested = null == _globalThis.window ? void 0 : _self.ctorBox.n
  } = {}
} = {};
function withParamDefault({
  missParam = null == (_ref3 = null == _globalThis.window ? void 0 : _self.ctorBox.list) ? void 0 : _at(_ref3).call(_ref3, 0)
} = {}) {
  return missParam;
}
export { missObject, missArray, missNested };
export const paramDefault = withParamDefault();

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref4 = _atMaybeArray(_ref5 = ['ab', 'cd']).call(_ref5, (null == _globalThis.window ? void 0 : _self.ctorBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref4).call(_ref4, 'a');