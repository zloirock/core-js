// an array WRAPPER over a literal is a pairing, not a hop: the element it matches is what the leaf
// reads through. a sole wrapper dies whole; one with a neighbour keeps the literal for that
// neighbour's coercion while the emptied hop prunes to `{}`, and an EFFECT-bearing neighbour makes
// the extraction wait - native evaluates every element before reading a property off any of them
let reads = 0;
const src = { get y() { reads += 1; return [1, [2]]; } };
const wrapped = (function () {
  const [{ y: { at } }] = [src];
  return at;
})();
const neighbour = (function () {
  const [{ y: { at } }, other] = [src, 1];
  return [at, other];
})();
const effectNeighbour = (function () {
  const marks = [];
  const [{ y: { at } }, other] = [src, marks.push('n')];
  return [at, other, marks];
})();
const assigned = (function () {
  let at;
  ([{ y: { at } }] = [src]);
  return at;
})();
export { wrapped, neighbour, effectNeighbour, assigned, reads };
