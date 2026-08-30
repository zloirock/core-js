// BOTH effects around a folded SE-key static extraction survive in native order: the receiver's
// sequence prefix LIFTS ahead of the extraction (the source ran it before the pattern bound
// anything) and the plus-fold computed-key effect runs second, in the kept residual key, off the
// bare tail the lift left there. the extraction still binds the pure static
const e = [];
const { [(e.push('k'), 'fr') + 'om']: from } = (e.push('r'), Array);
export const r = [from, e];
