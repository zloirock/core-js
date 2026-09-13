// A nested leaf with siblings uses one receiver capture for the method and the remaining
// properties, at any depth. An outer sibling requires a capture of the root as well; the nested
// read and outer sibling then retain source property order.
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
