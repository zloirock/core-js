import _self from "@core-js/pure/actual/self";
// NEGATIVE: a proxy-global alias hop captured before the aliasing write reads undefined -
// the hop must not collapse to the pure global surface
let g;
const sBefore = g;
g = _self;
export const d = sBefore.Array.from(items);