import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `Object.defineProperty(o, key, desc)` adds / redefines a property on the target (index 0).
// mutates argument 0; classifier returns 'leak' for `o` at that slot. narrowing on `arr` is
// abandoned. covers the Object.defineProperty entry that ships `mutatesArgument: [0]`
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    Object.defineProperty(o, "x", {
      value: 1
    });
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();