// Where an SE prefix ends up decides whether the host buried in it is still an ordinary host.
// A residual that RE-ANCHORS onto the hop's own pure carries the prefix inside its rebuilt init,
// so that slice is REPLAYED verbatim - the buried destructure host may not fold there, and the
// prefix keeps the spelling the source wrote. A FULL consume instead LIFTS the prefix into a
// statement of its own, where it is an ordinary host again: it folds its proxy hop and reads off
// the substituted root. The for-init sink asks the same question, and its re-anchored residual
// keeps the ONE declarator with the prefix in its value instead of a discard slot beside it.
function eff() { return 0; }
let cf, cf2, cf3, outFR;
// RE-ANCHORED residual: the prefix rides the rebuilt init, buried host verbatim
const { Promise: { customFR: fr } } = (({ self: { onoffline: cf } } = globalThis), globalThis);
// FULL consume: the prefix lifts as its own statement and the buried host folds there
const { Map: { groupBy: gb } } = (({ self: { onoffline: cf2 } } = globalThis), globalThis);
// ... and the same re-anchor inside a for-init sink keeps one declarator
for (const { Promise: { customFR: fr2 } } = (({ self: { onoffline: cf3 } } = globalThis), globalThis); !outFR;) outFR = fr2;
// a plain SE prefix over a surviving residual keeps its own init too (no buried host)
const { Promise: { try: tryFn, customP } } = (eff(), globalThis);
export { cf, cf2, cf3, fr, gb, outFR, tryFn, customP };
