// a CALL / IIFE-rooted proxy chain consumed by a fully-static destructure (`const {iterator} =
// (f()).self.Symbol`): the receiver value is DISCARDED (the prop synth-swaps to a direct pure import), so what
// survives is the HARVEST alone - a SE-bearing chain-root call runs where the source ran it, a provably pure
// one drops with the navigation, and with nothing harvested the whole residual goes: the read it would spell
// stands on an always-defined binding and observes nothing the extraction does not.
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
