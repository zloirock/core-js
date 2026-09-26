// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const box = { y: Object.assign([1, [2]], { extra: 7 }) };
const bare = (function () {
  const { y: { flat, ...rest } } = box;
  return [flat, rest.extra, 'flat' in rest];
})();
const withSibling = (function () {
  const { y: { flat, extra, ...rest } } = box;
  return [flat, extra, Object.keys(rest).length];
})();
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
