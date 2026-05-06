// `Object.assign(...sources, o)` - SpreadElement before `o` perturbs the runtime arg index.
// AST position 1 looks like "source slot" (non-mutating), but at runtime `o` could land at
// any index depending on `sources.length`: if `sources` is empty, `o` becomes the target
// (mutated, index 0). helper can't reason about expansion arity, so any leading spread
// bails to 'leak'. negative-by-design lock for the
// `for (let i = 0; i < argIndex; i++) if (args[i]?.type === 'SpreadElement') return false`
// guard inside isKnownNonMutatingCallSite - protects soundness when `sources.length === 0`
const sources = [];
const o = {
  arr: [1, 2, 3],
  test() {
    Object.assign(...sources, o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
