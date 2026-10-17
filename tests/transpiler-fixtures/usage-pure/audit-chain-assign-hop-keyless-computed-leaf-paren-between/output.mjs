import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// user parens between the hop and the leaf: the anchor-edge peel sees through them, the
// collapse still owns the span (the wrapper survives as source cosmetics)
let pa;
export const parenBetween = (pa = _globalThis, _self)[0];