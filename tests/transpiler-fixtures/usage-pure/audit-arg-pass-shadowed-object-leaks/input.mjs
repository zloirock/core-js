// `Object` shadowed by a local binding in this scope - the call no longer references the
// global built-in so the mutatesArgument table does not apply. classifier checks
// `refPath.scope.getBinding(callee.object.name)`; finds a local binding, returns false from
// resolveKnownStaticEntry, falls through to 'leak'. negative-by-design: shadowing is the
// classic poisoned-built-in attack surface that the soundness contract must respect even
// when the shadow itself is harmless
const Object = { assign: function (target) { return target; } };
const o = {
  arr: [1, 2, 3],
  test() {
    Object.assign(o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
