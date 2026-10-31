// an ARRAY pattern element cannot be SPELLED - `rows[0]` reads a property where the pattern pulls
// from an iterator - so the slot takes a minted binding, the declaration keeps its own iteration,
// and the claim reads that binding after it. a SPREAD ahead of the slot makes the pairing
// unknowable, and this route never asks: whatever the source's slot received is what it reads
const rows = [[1, [2]], [3]];
const sole = (function () {
  const [{ at }] = rows;
  return at;
})();
const withHops = (function () {
  const nested = [{ y: [1, [2]] }];
  const [{ y: { flat } }] = nested;
  return flat;
})();
const neighbour = (function () {
  const [{ at }, other] = rows;
  return [at, other];
})();
const afterSpread = (function () {
  const xs = [[9]];
  const [, { at }] = [...xs, rows[0]];
  return at;
})();
export { sole, withHops, neighbour, afterSpread };
