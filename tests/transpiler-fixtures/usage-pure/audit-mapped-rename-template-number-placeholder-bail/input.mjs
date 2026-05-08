// `${number}` placeholder must validate numeric shape per segment so alphabetic keys cannot leak in.
// Per-key dispatch is observable: numeric matches narrow via their value type, non-numeric keys drop.
type Pick2<T> = { [K in keyof T as K extends `id_${ number }` ? K : never]: T[K] };
declare const r: Pick2<{ id_42: string[]; id_7e1: number[]; id_abc: boolean; other: symbol }>;
r.id_42.at(0);
r.id_7e1.includes(1);
