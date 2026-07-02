// mapped synthesis with cross-type-param indexing: `{ [K in keyof T]: U[K] }` re-keys
// T with U's value-types. `r.items` here resolves to U's `items` type (`string`), not
// T's array - dispatch must pick string-narrowed `.at`
type Wrong<T, U> = { [K in keyof T]: U[K] };
declare const r: Wrong<{ items: number[] }, { items: string; }>;
r.items.at(0);
