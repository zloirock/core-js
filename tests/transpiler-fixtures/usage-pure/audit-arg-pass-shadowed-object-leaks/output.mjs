import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `Object` shadowed by a local binding in this scope - the call no longer references the
// global built-in so the mutatesArgument table does not apply. classifier checks
// `refPath.scope.getBinding(callee.object.name)`; finds a local binding, returns false from
// resolveKnownStaticEntry, falls through to 'leak'. negative-by-design: shadowing is the
// classic poisoned-built-in attack surface that the soundness contract must respect even
// when the shadow itself is harmless
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