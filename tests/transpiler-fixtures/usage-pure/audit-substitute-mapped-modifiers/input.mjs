// Mapped type with `-readonly`/`+?` modifiers preserves the member set; identity body still passes through.
// Substitution must descend into `T[K]` so the concrete `data: number[]` survives the wrapper.
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
declare function probe<T>(arg: T): Mutable<T>;
const r = probe<{ data: number[] }>(null!);
r.data.at(0);
