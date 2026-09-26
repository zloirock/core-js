import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A nested read uses its paired element. Effectful neighbours require capturing that element
// before the property read; a compact residual keeps the other positions and their coercions.
let reads = 0;
const src = {
  get y() {
    reads += 1;
    return [1, [2]];
  }
};
const wrapped = function () {
  const at = _atMaybeArray(src.y);
  return at;
}();
const neighbour = function () {
  const at = _atMaybeArray(src.y);
  const [{}, other] = [src, 1];
  return [at, other];
}();
const effectNeighbour = function () {
  const marks = [];
  const [_ref, _ref2] = [src, _pushMaybeArray(marks).call(marks, 'n')];
  const at = _atMaybeArray(_ref.y);
  const other = _ref2;
  return [at, other, marks];
}();
const assigned = function () {
  var _ref3;
  let at;
  [_ref3] = [src];
  at = _atMaybeArray(_ref3.y);
  return at;
}();
export { wrapped, neighbour, effectNeighbour, assigned, reads };