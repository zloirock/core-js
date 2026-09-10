import _Array$of2 from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a bundler rewrites every import into its own module call, so a pass over BUNDLED output sees the
// bindings a prior pass minted by NAME alone - the import that bound them is gone. the own-output
// census recognized its guard render by that import and went blind here, re-claiming the alternate
// and nesting the guard one level per pass. the minted spelling is enough to say WHICH read the
// render stands for. what the stand-down turns on is the TEST: the second row reads another member
// under the SAME test, and its arm is off limits for the same reason the kept read is - there the
// receiver is provably not that global. the third row tests against ANOTHER global, which settles
// nothing, so its alternate keeps its claim. the receiver is read off the realm so the claim is live
// at all; `Array` is the global core-js never replaces, so the render tests the bare name
const _Array$of = wr(1);
let h;
if (_globalThis) ({
  Array: h
} = _globalThis);
export const ownRender = h === Array ? _Array$of : h.of;
export const foreignMember = h === Array ? _Array$of : h.from;
export const foreignGuardName = h === Object ? _Array$of : h === Array ? _Array$of2 : h.of;