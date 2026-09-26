// The written element shapes differ on a required field, so the conditional is false.
// Retaining their complete member maps selects string.at despite the absent inner dispatch type.
type Sel<T> = T extends Array<{ b: number }> ? number[] : string;
declare const v: Array<{ a: string }>;
declare const r: Sel<typeof v>;
r.at(0);
