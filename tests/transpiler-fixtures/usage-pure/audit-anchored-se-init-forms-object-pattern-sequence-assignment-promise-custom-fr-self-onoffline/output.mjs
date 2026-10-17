import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// recursion boundary: a host buried in the prefix an ANCHORED RESIDUAL itself replays
// stays verbatim (root substituted, effect once) - replayed slices are not re-folded
let customFR, outFR;
for (const {
  customFR: fr
} = ({
  onoffline: customFR
} = _globalThis, _Promise); !outFR;) outFR = fr;
export const r = [customFR, outFR];