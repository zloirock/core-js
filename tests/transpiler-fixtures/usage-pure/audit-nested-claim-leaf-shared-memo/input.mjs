// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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
