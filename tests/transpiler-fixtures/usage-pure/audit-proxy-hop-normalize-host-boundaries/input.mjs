// the proxy-hop normalization fires only where the host's VALUE is discarded and a
// default cannot pick a caller argument; each line locks one host boundary.
// an assignment-expression value is the proxy object itself - a used value bails
let customV;
const v = ({ Map: { customV } } = globalThis);
// a chained assignment uses the inner value too
let customC, c;
c = { Promise: { customC } } = globalThis;
// a param default destructures the CALLER argument when one is provided - never normalized
function f({ Iterator: { customP } } = globalThis) { return customP; }
export const fr = f();
// a TS cast peels to the receiver like the flat form - normalizes
const { Set: { customT } } = (globalThis as any);
// a discarded sequence-tail assignment is a statement context - normalizes
let customS;
(eff(), { WeakMap: { customS } } = globalThis);
// a for-init assignment slot is not a statement context - bails
let customF;
for (({ WeakSet: { customF } } = globalThis); cond(); ) use(customF);
// a concise arrow body returns the assignment value - bails
let customA;
const g = () => ({ Symbol: { customA } } = globalThis);
use(v, c, customT, customS, g);
