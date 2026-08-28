// a nested pattern whose LEAF level keeps siblings is the flat shape written the long way, so it
// flattens onto that twin and the hop reads ONCE into a memo the dispatch and the residual share -
// however DEEP the chain is, since both spellings of the flattened receiver now fold the same
// writer set. a HOST sibling is the one that stays native: it names another key off the root and
// would lose its binding in that rewrite
const box = { y: [1, [2]], keep: 3 };
const deep = { a: { b: [1, [2]] } };
const leafSiblings = (function () {
  const { y: { at, other } } = box;
  return [at, other];
})();
const hostSibling = (function () {
  const { y: { at, other }, keep } = box;
  return [at, other, keep];
})();
const twoHops = (function () {
  const { a: { b: { at, other } } } = deep;
  return [at, other];
})();
export { leafSiblings, hostSibling, twoHops };
