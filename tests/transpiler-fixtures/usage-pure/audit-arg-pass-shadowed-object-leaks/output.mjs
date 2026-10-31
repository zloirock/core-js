import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Local binding `Object` shadows the global, so its `assign` cannot be assumed read-only.
// Classification must fall back to leak whenever the receiver namespace is locally bound.
const Object = {
  assign: function (target) {
    return target;
  }
};
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    Object.assign(o);
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();