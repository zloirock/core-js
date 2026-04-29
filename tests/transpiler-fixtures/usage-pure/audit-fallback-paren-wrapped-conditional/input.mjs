// `(cond ? Array : Iterator)` - paren-wrapped fallback receiver. Per-branch destructure
// rewriting peels the outer paren wrapper to reach the conditional, so each branch's
// identifier reaches the receiver classifier and both sides emit their polyfill
export const { from } = (cond ? Array : Iterator);
