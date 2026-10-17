// recursion boundary: a host buried in the prefix an ANCHORED RESIDUAL itself replays
// stays verbatim (root substituted, effect once) - replayed slices are not re-folded
let customFR, outFR;
for (const { Promise: { customFR: fr } } = (({ self: { onoffline: customFR } } = globalThis), globalThis); !outFR;) outFR = fr;

export const r = [customFR, outFR];
