// global flavor of the multi-name early exit: each De Morgan arm narrows its own binding,
// so only the string modules inject for both member reads - no array-variant over-inject
declare const a: string | string[];
declare const b: string | number[];
if (typeof a !== 'string' || typeof b !== 'string') throw new Error('shape');
export const r1 = a.at(0);
export const r2 = b.includes('b');
