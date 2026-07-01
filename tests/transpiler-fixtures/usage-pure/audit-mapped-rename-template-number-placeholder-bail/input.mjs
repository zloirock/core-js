// `${number}` placeholder must validate numeric shape per segment so alphabetic keys cannot leak in.
// Per-key dispatch is observable: numeric matches narrow via their value type, non-numeric keys drop.
// canonical: a canonical integer (`42`) and an exponential (`7e1`) match, but a leading-zero integer
// (`08`) does NOT - TS's `${number}` rejects the non-canonical form, so it must bail to the generic helper.
type Pick2<T> = { [K in keyof T as K extends `id_${ number }` ? K : never]: T[K] };
declare const r: Pick2<{ id_42: string[]; id_7e1: number[]; id_08: string[]; id_abc: boolean; other: symbol }>;
r.id_42.at(0);
r.id_7e1.includes(1);
r.id_08.at(-1);
