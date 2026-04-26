// `((cond ? Array : Iterator) as any)` - TS expression wrapper around a fallback.
// babel parser strips parens but keeps TSAsExpression; oxc keeps both. per-branch
// synth-swap must peel both wrapper layers to reach the conditional underneath
export const { from } = ((cond ? Array : Iterator) as any);
export const { values } = (Array || Set)!;
