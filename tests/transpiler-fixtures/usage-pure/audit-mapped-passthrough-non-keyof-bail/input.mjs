// `{ [K in keyof T]: number[] }` is non-identity body so passthrough must bail.
// Identity-rename expansion still produces concrete members so the array-narrow polyfill is picked.
type Wrap<T> = { [K in keyof T]: number[] };
declare const r: Wrap<{ items: string; name: boolean }>;
r.items.at(0);
r.name.findLast(x => true);
