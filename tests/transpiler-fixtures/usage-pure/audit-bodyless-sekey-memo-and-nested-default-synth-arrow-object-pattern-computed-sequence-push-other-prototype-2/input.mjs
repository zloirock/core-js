// Bodyless computed-key destructures evaluate the receiver once and extract properties in order.
// Instance parameter defaults retain their receiver-read limits. Nested defaults belong to their
// own receiver slot in declarations, assignments and catch parameters.
const log = [];
const cond = true;
// ... and an EFFECTFUL init rides the same memo - one evaluation, where the source ran it
export const a4 = (() => { if (cond) var { [(log.push('k'), 'flat')]: m, other } = (() => { log.push('call'); return Array.prototype; })(); return [typeof m, typeof other]; })();
export const r = [a4];
