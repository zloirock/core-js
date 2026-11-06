import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the fold is INDEPENDENT of which spelling roots the probe: an alias written outside the
// sequence and the bare global root take the same fold as the same-sequence alias - the store
// hands the guarded value on either way, and the probe's `?.` slides one member up
const ga7 = _globalThis;
// NEGATIVE: the hop at the CHAIN END has no member to carry the read - it keeps its shape
let w10;
export const chainEndKeepsHop = (w10 = null == ga7.window ? void 0 : _self).window;