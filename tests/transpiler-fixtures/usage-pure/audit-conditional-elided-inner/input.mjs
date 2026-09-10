// a container's inner slot reads empty for two reasons that print alike: nothing was WRITTEN
// (`Array` is `Array<any>` and matches any inner), or an argument was written and no Type form
// carries it - `{ a: string }` has none. Read as agreement, two such absences pick the TRUE branch
// tsc answers FALSE, keying an array-only `at` to a value the false branch types as a string
type Sel<T> = T extends Array<{ b: number }> ? number[] : string;
declare const v: Array<{ a: string }>;
declare const r: Sel<typeof v>;
r.at(0);
