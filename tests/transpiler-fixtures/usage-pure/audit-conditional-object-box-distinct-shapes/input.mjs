// These interfaces have different required fields even though both resolve to Object boxes.
// Their complete member maps prove the conditional false, selecting string.at.
interface Wanted { wanted: string }
interface Other { other: number }
type Sel<T> = T extends Array<Other> ? number[] : string;
declare const v: Array<Wanted>;
declare const r: Sel<typeof v>;
r.at(0);
