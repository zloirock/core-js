// The array elements are tuples with their positions reversed. The conditional selects string.
type Sel<T> = T extends Array<[string, number]> ? number[] : string;
declare const v: Array<[number, string]>;
declare const r: Sel<typeof v>;
r.at(0);
