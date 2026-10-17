// the same slots over a CALL root, whose guard test carries the root effect. a claim's MEMBER
// tail grows through the same shared walk an invoked one does - spelling it by a rule of its own
// folded a different number of steps than babel for the same source
const cr = () => globalThis;
export const eqRightCall = 1 === cr().window?.self.Set.prototype.constructor.length;
