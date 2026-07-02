// `as` key remap blocks the passthrough fast-path; expansion must enumerate source keys per rename template.
// Renamed key `_a` must still resolve to the source value (`number[]`) so the array narrow fires.
type RenameKeys<T> = { [K in keyof T as `_${string & K}`]: T[K] };
type Renamed = RenameKeys<{ a: number[] }>;
declare const r: Renamed;
r._a.at(0);
