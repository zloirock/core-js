// that hop read is a getter call, so the extraction is sound only where it OWNS it. a HOST sibling
// is no obstacle - the leaf leaves and the emptied hop prunes with it - but a sibling INSIDE the
// nested pattern keeps the hop for its own binding, and there the claim stays native: a standing
// miss the ownership rule buys, not a shape that wants to stay raw
let reads = 0;
const src = { get y() { reads += 1; return [1, [2]]; }, keep: 1 };
const hostSibling = (function () {
  const { y: { at }, keep } = src;
  return [at, keep];
})();
const innerSibling = (function () {
  const box = { y: { at: 1, other: 2 } };
  const { y: { at, other } } = box;
  return [at, other];
})();
export { hostSibling, innerSibling, reads };
