// bodyless-if var host keeps the inline replay in the bodyless slot (effect stays conditional)
if (cond) var { self: { oncut: bod } } = (eff(), globalThis);
export const r = [bod];
