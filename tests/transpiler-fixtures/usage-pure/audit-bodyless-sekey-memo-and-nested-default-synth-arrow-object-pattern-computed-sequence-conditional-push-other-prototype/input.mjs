// Bodyless computed-key destructures evaluate the receiver once and extract properties in order.
// Instance parameter defaults retain their receiver-read limits. Nested defaults belong to their
// own receiver slot in declarations, assignments and catch parameters.
const log = [];
const cond = true;
// A bodyless slot evaluates its receiver once, checks object coercibility unless the receiver is never
// nullish (a literal, a built-in prototype), converts the computed key, extracts the method, then reads
// residual siblings in source order.
export const a1 = (() => { if (cond) var { [(log.push('k'), 'findLast')]: m, other } = 1 ? Array.prototype : []; return [typeof m, typeof other]; })();
export const r = [a1];
