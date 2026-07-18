// a same-operator De Morgan group MIXING variable names narrows neither binding: the
// complement leaves either variable possibly un-tested (`!(c !== 's' && d !== 's')` is an
// OR), so the `at` read stays on the generic helper. the single-name group below still
// folds to a typeof-or and narrows its binding to the string variant
declare const c: string | string[];
declare const d: string | number[];
if (typeof c !== 'string' && typeof d !== 'string') throw new Error('shape');
export const r1 = c.at(1);
declare const g: string | string[];
if (typeof g !== 'string' && typeof g !== 'number') throw new Error('shape');
export const r2 = g.includes('g');
