import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// an array WRAPPER over a literal is a pairing, not a hop: the element it matches is what the leaf
// reads through. a sole wrapper dies whole; one with a neighbour keeps the literal for that
// neighbour's coercion while the emptied hop prunes to `{}`, and an EFFECT-bearing neighbour makes
// the extraction wait - native evaluates every element before reading a property off any of them
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
  const [{}, other] = [src, _pushMaybeArray(marks).call(marks, 'n')];
  const at = _atMaybeArray(src.y);
  return [at, other, marks];
}();
const assigned = function () {
  let at;
  at = _atMaybeArray(src.y);
  return at;
}();
export { wrapped, neighbour, effectNeighbour, assigned, reads };