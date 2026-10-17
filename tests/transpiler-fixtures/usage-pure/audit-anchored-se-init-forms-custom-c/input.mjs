// negative: a ternary-branch effect keeps the nested handling (branch may not be taken)
const { Iterator: { customC } } = (cond ? (eff(), globalThis) : globalThis);
export const r = [customC];
