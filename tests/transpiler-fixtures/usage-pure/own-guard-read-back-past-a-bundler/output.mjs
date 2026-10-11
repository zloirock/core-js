import _Array$of2 from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a pass over bundled output knows a binding a prior pass minted by its name alone, so the census
// stands the alternate down - a member read, a call render, another member under the same test; a
// test against another global keeps its claim. the receiver is read off the realm on one path only, so
// the claim is live and the value open, and `Array` is never replaced, so the render tests the bare name
const _Array$of = wr(1);
let h;
if (flag) ({
  Array: h
} = _globalThis);
export const ownRender = h === Array ? _Array$of : h.of;
export const foreignMember = h === Array ? _Array$of : h.from;
export const foreignGuardName = h === Object ? _Array$of : h === Array ? _Array$of2 : h.of;
export const absorbedCall = h === Array ? _Array$of(1, 2) : h.of(1, 2);