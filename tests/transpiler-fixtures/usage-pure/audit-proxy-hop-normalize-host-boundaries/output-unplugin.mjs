import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// the proxy-hop normalization fires only where the host's VALUE is discarded and a
// default cannot pick a caller argument; each line locks one host boundary.
// an assignment-expression value is the proxy object itself - a used value bails
let customV;
const v = ({ Map: { customV } } = _globalThis);
// a chained assignment uses the inner value too
let customC, c;
c = { Promise: { customC } } = _globalThis;
// a param default destructures the CALLER argument when one is provided - never normalized
function f({ Iterator: { customP } } = _globalThis) { return customP; }
export const fr = f();
// a TS cast peels to the receiver like the flat form - normalizes
const { customT } = _Set;
// a discarded sequence-tail assignment is a statement context - normalizes
let customS;
eff(); ({ customS } = _WeakMap);
// a for-init assignment slot is not a statement context - bails
let customF;
for (({ WeakSet: { customF } } = _globalThis); cond(); ) use(customF);
// a concise arrow body returns the assignment value - bails
let customA;
const g = () => ({ Symbol: { customA } } = _globalThis);
use(v, c, customT, customS, g);