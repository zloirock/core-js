import _globalThis from "@core-js/pure/actual/global-this";
import _Math$fround from "@core-js/pure/actual/math/fround";
// the same slots over a CALL root, whose guard test carries the root effect. a claim's MEMBER
// tail grows through the same shared walk an invoked one does - spelling it by a rule of its own
// folded a different number of steps than babel for the same source
const cr = () => _globalThis;
export const gtRightCall = 2 > (null == cr().window ? void 0 : _Math$fround(1.5));