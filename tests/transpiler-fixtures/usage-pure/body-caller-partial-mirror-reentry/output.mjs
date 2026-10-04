import _Math$atanh from "@core-js/pure/actual/math/atanh";
// A partial argument mirror created by a call in a function body belongs to that invocation.
// Getter reentry cannot redirect a later sibling read to the nested invocation's argument.
let depth = 0;
let count = 0;
let inner;
const built = () => ({
  a: Math,
  get z() {
    if (depth++ === 0) inner = outer();
    return 'z';
  },
  w: ++count
});
function read({
  a: {
    atanh: fn
  },
  z,
  w
}) {
  return [typeof fn, z, w];
}
function outer() {
  var _ref;
  return read((_ref = built(), {
    a: {
      atanh: _Math$atanh
    },
    z: _ref.z,
    w: _ref.w
  }));
}
export const result = [outer(), inner];