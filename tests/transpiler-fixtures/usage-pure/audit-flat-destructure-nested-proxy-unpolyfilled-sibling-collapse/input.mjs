// a flat destructure off a NESTED proxy-global member (`globalThis.self.Array`) with one polyfilled
// key and one unpolyfilled key: the claim extracts, and the residual keeping the unpolyfilled key
// reads its receiver through the collapsed hop - the pure `self` entry, since `globalThis.self` is
// absent off-browser on the targets.
const { of, other } = globalThis.self.Array;
of(1, 2);
console.log(other);
