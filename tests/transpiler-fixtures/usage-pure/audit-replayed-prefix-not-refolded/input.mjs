// An assignment buried in a receiver prefix keeps its own polyfill and effects.
// Declaration, assignment and loop-header hosts preserve the prefix's evaluation order.
function eff() { return 0; }
let cf, cf2, cf3, outFR;
// RE-ANCHORED residual: the prefix rides the rebuilt init, and the buried host folds inside it
const { Promise: { customFR: fr } } = (({ self: { onoffline: cf } } = globalThis), globalThis);
// FULL consume: the prefix lifts as its own statement and the buried host folds there
const { Map: { groupBy: gb } } = (({ self: { onoffline: cf2 } } = globalThis), globalThis);
// ... and the same re-anchor inside a for-init sink keeps one declarator
for (const { Promise: { customFR: fr2 } } = (({ self: { onoffline: cf3 } } = globalThis), globalThis); !outFR;) outFR = fr2;
// a plain SE prefix over a surviving residual keeps its own init too (no buried host)
const { Promise: { try: tryFn, customP } } = (eff(), globalThis);
export { cf, cf2, cf3, fr, gb, outFR, tryFn, customP };
