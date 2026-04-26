// `(cond ? Array : Iterator)` - paren-wrapped fallback receiver. oxc preserves
// ParenthesizedExpression; without peeling, only one branch's identifier got polyfilled
// by the inner Identifier visitor (the other side stayed raw). per-branch synth-swap
// must reach the conditional underneath the paren wrapper
export const { from } = (cond ? Array : Iterator);
