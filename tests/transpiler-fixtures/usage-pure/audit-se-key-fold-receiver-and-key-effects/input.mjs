// BOTH effects around a folded SE-key static extraction survive in native order: the receiver's
// sequence prefix (runs first, with the init) and the plus-fold computed-key effect (runs second,
// in the kept residual key). the extraction still binds the pure static
const e = [];
const { [(e.push('k'), 'fr') + 'om']: from } = (e.push('r'), Array);
export const r = [from, e];
