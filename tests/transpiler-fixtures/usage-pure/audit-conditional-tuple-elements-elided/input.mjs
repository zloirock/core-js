// Tuple elements that do not fold to one type are dropped, and the absence they leave is the one a
// bare `Array` has - which means `Array<any>` and matches any element. Two differently ordered
// tuples both end there, so reading the two absences as agreement takes the TRUE branch where tsc
// compares the elements and answers FALSE.
type Sel<T> = T extends Array<[string, number]> ? number[] : string;
declare const v: Array<[number, string]>;
declare const r: Sel<typeof v>;
r.at(0);
