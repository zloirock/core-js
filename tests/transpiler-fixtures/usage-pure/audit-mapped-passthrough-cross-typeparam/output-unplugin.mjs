import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// mapped synthesis with cross-type-param indexing: `{ [K in keyof T]: U[K] }` re-keys
// T with U's value-types. `r.items` here resolves to U's `items` type (`string`), not
// T's array - dispatch must pick string-narrowed `.at`
type Wrong<T, U> = { [K in keyof T]: U[K] };
declare const r: Wrong<{ items: number[] }, { items: string; }>;
_atMaybeString(_ref = r.items).call(_ref, 0);