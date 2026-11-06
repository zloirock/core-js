import _Math$atanh from "@core-js/pure/actual/math/atanh";
// A partial parameter mirror retains the whole argument throughout sibling getter reads.
// Getter reentry cannot redirect a later sibling read to the nested invocation's argument.
let depth = 0;
let count = 0;
let inner;
const built = () => ({
  a: Math,
  get z() {
    if (depth++ === 0) inner = read();
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
} = (() => {
  var _ref;
  return _ref = built(), {
    a: {
      atanh: _Math$atanh
    },
    z: _ref.z,
    w: _ref.w
  };
})()) {
  return [typeof fn, z, w];
}
export const result = [read(), inner];