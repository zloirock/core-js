// the symbol leaf extracts through the helper wherever the extraction OWNS the hop read: a sole
// slot, and a slot beside a HOST sibling too - the leaf leaves and the emptied hop prunes with it,
// so the sibling reads its own key. a DEFAULT rides along rather than bounding it: what the slot
// answers under polyfill-always-wins is the helper's result, so the guard folds around the call -
// on the slot and on the leaf alike. the key swap is the ANCHORED family's answer, not this one
const symbolSole = (function () {
  const box = { inner: [1] };
  const { inner: { [Symbol.iterator]: it } } = box;
  return it;
})();
const symbolSibling = (function () {
  const box = { inner: [1], keep: 2 };
  const { inner: { [Symbol.iterator]: it }, keep } = box;
  return [it, keep];
})();
const symbolDefault = (function () {
  const box = { inner: [1], keep: 2 };
  const { inner: { [Symbol.iterator]: it } = [], keep } = box;
  return [it, keep];
})();
const symbolLeafDefault = (function () {
  const box = { inner: [1] };
  function fallback() { return null; }
  const { inner: { [Symbol.iterator]: it = fallback } } = box;
  return it;
})();
export { symbolSole, symbolSibling, symbolDefault, symbolLeafDefault };
