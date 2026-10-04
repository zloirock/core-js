import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A nested read uses its paired element after every RHS effect.
// Stable names need no capture; a compact residual keeps other positions and their coercions.
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
  const [, _ref] = [src, _pushMaybeArray(marks).call(marks, 'n')];
  const at = _atMaybeArray(src.y);
  const other = _ref;
  return [at, other, marks];
}();
const assigned = function () {
  let at;
  [,] = [src];
  at = _atMaybeArray(src.y);
  return at;
}();
export { wrapped, neighbour, effectNeighbour, assigned, reads };