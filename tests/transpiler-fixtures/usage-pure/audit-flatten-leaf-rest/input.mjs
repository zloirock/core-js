// a REST inside the LEAF travels with it: the twin keeps the leaf's own pattern, so the rest gathers
// off the memo instead of the source read - and the claim's key stays there as a sentinel, still
// excluding itself from what the rest collects, which is what native does
const box = { y: Object.assign([1, [2]], { extra: 7 }) };
const bare = (function () {
  const { y: { flat, ...rest } } = box;
  return [flat, rest.extra, 'flat' in rest];
})();
// ... and a sibling BINDING beside the rest keeps its own key out of it too
const withSibling = (function () {
  const { y: { flat, extra, ...rest } } = box;
  return [flat, extra, Object.keys(rest).length];
})();
// ... and two claims off one leaf share the memo the rest reads
const twoClaims = (function () {
  const { y: { flat, at, ...rest } } = box;
  return [flat, at, 'flat' in rest, 'at' in rest];
})();
// ... and the array WRAPPER host answers the same, its element reached through the binding
const wrapped = (function () {
  const [{ y: { flat, ...rest } }] = [box];
  return [flat, rest.extra];
})();
export { bare, withSibling, twoClaims, wrapped };
