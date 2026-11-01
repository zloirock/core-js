// Proxy hops preserve the host's result; parameter defaults still read caller arguments.
// An assignment yields the realm while its nested target reads the ponyfill.
let customV;
// @ts-expect-error a static the constructor lacks is the read under test
const v = ({ Map: { customV } } = globalThis);
// a chained assignment uses the inner value too
let customC, c;
// @ts-expect-error a static the constructor lacks is the read under test
c = { Promise: { customC } } = globalThis;
// a param default destructures the CALLER argument when one is provided - never normalized
// @ts-expect-error a static the constructor lacks is the read under test
function f({ Iterator: { customP } } = globalThis) { return customP; }
export const fr = f();
// a TS cast peels to the receiver like the flat form - normalizes
const { Set: { customT } } = (globalThis as any);
// a discarded sequence-tail assignment is a statement context - normalizes
let customS;
// @ts-expect-error a static the constructor lacks is the read under test
(eff(), { WeakMap: { customS } } = globalThis);
// A for-init assignment keeps its expression in the loop header.
let customF;
// @ts-expect-error a static the constructor lacks is the read under test
for (({ WeakSet: { customF } } = globalThis); cond(); ) use(customF);
// A concise arrow body returns the original assignment value.
let customA;
// @ts-expect-error a static the constructor lacks is the read under test
const g = () => ({ Symbol: { customA } } = globalThis);
use(v, c, customT, customS, g);
