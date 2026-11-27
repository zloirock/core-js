// Decimal, exponential and leading-zero text match a numeric template. Alphabetic text does not.
type Pick2<T> = { [K in keyof T as K extends `id_${ number }` ? K : never]: T[K] };
declare const r: Pick2<{ id_42: string[]; id_7e1: number[]; id_08: string[]; id_abc: boolean; other: symbol }>;
r.id_42.at(0);
r.id_7e1.includes(1);
r.id_08.at(-1);
