import _Object$assign from "@core-js/pure/actual/object/assign";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
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
    var _ref, _ref2;
    _Object$assign(...sources, o);
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();