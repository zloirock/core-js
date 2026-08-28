// hops naming USER keys resolve the leaf through the receiver's own TYPE, so the dispatch reads
// the hop the source reads (`src.y`). hops that merely REACH a built-in namespace are a name
// match instead, and there the leaf keeps its slot read
const src = { y: [1, [2]] };
const sole = (function () {
  const { y: { at } } = src;
  return at;
})();
const deep = (function () {
  const nest = { a: { b: [1, [2]] } };
  const { a: { b: { flat } } } = nest;
  return flat;
})();
const nameMatch = (function () {
  const { Array: { keys } } = globalThis;
  return keys;
})();
export { sole, deep, nameMatch };
