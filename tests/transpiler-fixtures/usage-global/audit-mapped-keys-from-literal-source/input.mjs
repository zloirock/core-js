// A mapped type keyed on a fixed literal key-set carries THOSE keys, not the keys of the type its
// body indexes, so a member present only in the indexed type must not resolve. The string module
// is the first row's verdict - a resolved receiver would be array-only - while the second row
// proves the real keys still resolve through the per-key expansion.
type Pair<T> = { [K in keyof { x: unknown; y: unknown; }]: T[K] };
declare const p: Pair<{ x: number[]; y: number; extra: string; }>;
p.extra.at(0);
p.x.includes(1);
