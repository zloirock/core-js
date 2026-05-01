// Nested structure-preserving wrapper: `Readonly<Required<{ data: number[] }>>` — both wrappers transparent
type Inner = { data: number[] };
type Wrapped = Readonly<Required<Inner>>;
declare const w: Wrapped;
w.data.at(0);
