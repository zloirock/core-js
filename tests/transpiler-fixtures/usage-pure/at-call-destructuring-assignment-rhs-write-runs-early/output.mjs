import _at from "@core-js/pure/actual/instance/at";
// The method call precedes this destructuring assignment and sees the original array.
const o = {
  f: [1, 2],
  m() {
    var _ref;
    return _at(_ref = this.f).call(_ref, 0);
  }
};
o.m();
let q;
[q] = [o.f = 'str'];
export { q };

// This default runs after the RHS has replaced the stored array with a string.
export function duringAssignment() {
  const box = {
    f: [7],
    m() {
      var _ref2;
      return _at(_ref2 = this.f).call(_ref2, 0);
    }
  };
  let result;
  [result = box.m()] = (box.f = 'str', []);
  return result;
}