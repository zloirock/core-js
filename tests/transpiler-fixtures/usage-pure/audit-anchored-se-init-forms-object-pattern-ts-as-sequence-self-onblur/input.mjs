// transparent wrappers around the SE-init peel: a TS cast and oxc-kept parens both fold
const { self: { onblur: tb } } = ((eff(), globalThis) as any);
export const r = [tb];
