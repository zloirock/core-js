// once a leaf flattens onto its twin, EVERY claim in it reads the shared memo - a claim spelling
// the hop for itself would fire that getter a second time. the claims may take the leaf whole, and
// then the rewritten declarator binds nothing and leaves with the pattern. a COMPUTED sibling
// travels (it keeps its key node and its position); a REST one gathers what was not named and stays
const box = { y: [1, [2]], keep: 3 };
const twoClaims = (function () {
  const { y: { at, flat } } = box;
  return [at, flat];
})();
const claimAndSymbol = (function () {
  const { y: { at, [Symbol.iterator]: it } } = box;
  return [at, it];
})();
const computedSibling = (function () {
  const k = 'other';
  const { y: { at, [k]: dyn } } = box;
  return [at, dyn];
})();
const restSibling = (function () {
  const { y: { at, ...rest } } = box;
  return [at, rest];
})();
export { twoClaims, claimAndSymbol, computedSibling, restSibling };
