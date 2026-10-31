// `K extends number` rename predicate matches numeric-shape string keys produced by
// keyof-source enumeration; non-numeric keys fall through to the never branch
type NumOnly<T> = { [K in keyof T as K extends number ? K : never]: T[K] };
declare const r: NumOnly<{ 0: number[]; 1: string[]; alpha: boolean }>;
r[0].at(0);
r[1].includes('a');
