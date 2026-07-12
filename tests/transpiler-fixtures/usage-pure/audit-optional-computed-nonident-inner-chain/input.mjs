// a NON-poly computed inner method-get with a non-identifier key (`arr['a-b']`) forces the
// chain combine (a poly hop follows). the combined emit re-reads the inner member from the
// VERBATIM bracket source, never `arr.a-b` (which reparses as subtraction). an effect-free
// identifier key keeps its verbatim bracket form too - a dot respelling only appears when a
// folded key side effect strips the source form
declare const arr: { 'a-b'?: () => number[][]; from?: () => number[][] };
export const bracketed = arr['a-b']?.().flat().at(0);
export const dotted = arr['from']?.().includes(1);

// a NUMERIC computed inner (`arr[0]`) has no method name at all, so the inner is non-poly by
// construction. two trailing polys force the combine, which must keep the verbatim numeric
// index - bailing stranded them as overlapping standalone transforms (a composition crash)
declare const nums: { 0?: () => number[][] };
export const numeric = nums[0]?.().flat().at(0);

// a DYNAMIC computed key (`rec[k]`) is likewise non-poly; the combine keeps the verbatim key
declare const rec: Record<string, () => number[][]>;
declare const k: string;
export const dynamic = rec[k]?.().flat().at(0);
