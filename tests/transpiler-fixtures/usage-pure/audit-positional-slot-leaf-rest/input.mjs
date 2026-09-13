// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const rows = Object.assign([1, [2]], { extra: 7 });
const holder = { y: rows };
const viaCatch = (function () {
  try { throw [rows]; } catch ([{ at, ...rest }]) { return [at, rest.extra, 'at' in rest]; }
})();
// ... and the same one hop in, where the rename takes the element and the residual keeps the hop
const viaCatchNested = (function () {
  try { throw [holder]; } catch ([{ y: { at, ...rest } }]) { return [at, rest.extra]; }
})();
const viaCatchSibling = (function () {
  try { throw [rows]; } catch ([{ at, extra, ...rest } ]) { return [at, extra, Object.keys(rest).length]; }
})();
// NEGATIVE: a COMPUTED key is spelled by the claim's own channel, so the residual cannot re-emit it -
// the shape stays native rather than print a key the source never wrote
const viaComputedKey = (function () {
  try { throw [rows]; } catch ([{ [Symbol.iterator]: it, ...rest }]) { return [typeof it, Object.keys(rest).length]; }
})();
export { viaCatch, viaCatchNested, viaCatchSibling, viaComputedKey };
