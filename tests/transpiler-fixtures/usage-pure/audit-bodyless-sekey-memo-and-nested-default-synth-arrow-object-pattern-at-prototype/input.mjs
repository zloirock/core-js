const cond = true;
// negative: with no SE key and a quiet init the slot keeps its single statement, no memo
export const a5 = (() => { if (cond) var { at } = Array.prototype; return typeof at; })();
export const r = [a5];
