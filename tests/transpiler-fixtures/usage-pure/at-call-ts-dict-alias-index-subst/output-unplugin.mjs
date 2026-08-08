import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// generic dict alias `Dict<V> = { [k: string]: V }` instantiated as `Dict<number[]>`;
// string-keyed lookup should yield `number[]` so `.at(-1)` dispatches the array-specific
// polyfill. plain `_at` would be returned if the type param V leaks through the alias
// instead of being substituted with `number[]`
type Dict<V> = { [k: string]: V };
declare const d: Dict<number[]>;
_atMaybeArray(_ref = d["foo"]).call(_ref, -1);