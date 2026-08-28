import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// an ARRAY pattern element cannot be SPELLED - `rows[0]` reads a property where the pattern pulls
// from an iterator - so the slot takes a minted binding, the declaration keeps its own iteration,
// and the claim reads that binding after it. a SPREAD ahead of the slot makes the pairing
// unknowable, and this route never asks: whatever the source's slot received is what it reads
const rows = [[1, [2]], [3]];
const sole = function () {
  const [_ref] = rows;
  const at = _atMaybeArray(_ref);
  return at;
}();
const withHops = function () {
  const nested = [{
    y: [1, [2]]
  }];
  const [_ref2] = nested;
  const flat = _flatMaybeArray(_ref2.y);
  return flat;
}();
const neighbour = function () {
  const [_ref3, other] = rows;
  const at = _atMaybeArray(_ref3);
  return [at, other];
}();
const afterSpread = function () {
  const xs = [[9]];
  const [, _ref4] = [...xs, rows[0]];
  const at = _at(_ref4);
  return at;
}();
export { sole, withHops, neighbour, afterSpread };