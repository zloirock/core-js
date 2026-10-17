// Bodyless computed-key destructures evaluate the receiver once and extract properties in order.
// Instance parameter defaults retain their receiver-read limits. Nested defaults belong to their
// own receiver slot in declarations, assignments and catch parameters.
const log = [];
const cond = true;
export const a2 = (() => { if (cond) var { [(log.push('k'), 'flatMap')]: m, other } = null || Array.prototype; return [typeof m, typeof other]; })();
export const r = [a2];
