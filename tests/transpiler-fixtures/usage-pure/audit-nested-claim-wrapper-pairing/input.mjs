// A nested read uses its paired element. Effectful neighbours require capturing that element
// before the property read; a compact residual keeps the other positions and their coercions.
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
