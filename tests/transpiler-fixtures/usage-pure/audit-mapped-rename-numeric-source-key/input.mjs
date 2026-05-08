// Mapped over a source with numeric keys (`0`, `1`) must produce members lookable by numeric index.
// Synthesised member keys carry numeric strings; per-key matching has to accept them at lookup time.
type Tag<T> = { [K in keyof T as K]: T[K] };
declare const r: Tag<{ 0: number[]; 1: string[] }>;
r[0].at(0);
r[1].at(0);
