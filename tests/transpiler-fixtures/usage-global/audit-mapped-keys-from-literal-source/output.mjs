import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// A mapped type keyed on a fixed literal key-set carries THOSE keys, not the keys of the type its
// body indexes, so a member present only in the indexed type must not resolve. The string module
// is the first row's verdict - a resolved receiver would be array-only - while the second row
// proves the real keys still resolve through the per-key expansion.
// @ts-expect-error an index into a type parameter tsc cannot key is the shape under test
type Pair<T> = { [K in keyof {
  x: unknown;
  y: unknown;
}]: T[K] };
declare const p: Pair<{
  x: number[];
  y: number;
  extra: string;
}>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
p.extra.at(0);
p.x.includes(1);