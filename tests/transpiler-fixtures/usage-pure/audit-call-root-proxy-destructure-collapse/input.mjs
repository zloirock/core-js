// a CALL / IIFE-rooted proxy chain consumed by a fully-static destructure (`const {iterator} =
// (f()).self.Symbol`): the receiver value is DISCARDED (the prop synth-swaps to a direct pure import), so the
// receiver survives only as a residual whose `.self` hop reads undefined off-engine. collapse it enter-time by
// whole-swapping the pure-ctor leaf (`Symbol -> _Symbol`) like babel and harvesting the chain-root call ahead of
// it. a PURE chain-root call drops (`_Symbol`); a SE-bearing one is kept (`(r++, _Promise)`) so the call runs.
// covers an IIFE root, a bound-arrow root, a SE-arrow root, and a multi-prop pattern (collapse fires once)
let r = 0;
const { iterator } = (() => globalThis)().self.Symbol;
iterator;
const bf = () => globalThis;
const { from } = (bf()).self.Array;
from([1]);
const sf = () => (r++, globalThis);
const { resolve } = (sf()).self.Promise;
resolve(1);
const { keys, values } = (bf()).self.Object;
keys({});
values({});
