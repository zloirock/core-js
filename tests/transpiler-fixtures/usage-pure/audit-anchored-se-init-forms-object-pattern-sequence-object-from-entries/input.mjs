// FULL-consume multi-declarator: the split machinery keeps the lifted effect between siblings
const sC = sideA(), { Object: { fromEntries: fe } } = (eff(), globalThis), sD = sideB();

export const r = [sC, fe, sD];
