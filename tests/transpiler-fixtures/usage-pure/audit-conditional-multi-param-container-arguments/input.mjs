// The Map key types differ on a required field, so the conditional is false.
// Written argument member maps select string.at without widening the result to an array.
interface Wanted { wanted: string }
interface Other { other: number }
type Sel<T> = T extends Map<Other, number> ? number[] : string;
declare const v: Map<Wanted, number>;
declare const r: Sel<typeof v>;
r.at(0);
