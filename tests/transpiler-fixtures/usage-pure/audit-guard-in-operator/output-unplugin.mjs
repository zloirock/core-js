import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `'key' in obj` discriminates union by structural shape. plugin's resolver folds union
// branches via foldUnionTypes; heterogeneous `Array | { length: number }` lacks shared
// narrow shape so it collapses to commonType (Object), not Array. dispatch falls back to
// GENERIC `_at` / `_includes` despite Array being one branch. the `in` guard is irrelevant
// to fold semantics - it's runtime narrowing that doesn't propagate to plugin's static fold
declare const r: number[] | { length: number };
if ('flat' in r) {
  _at(r).call(r, 0);
  _includes(r).call(r, 1);
}
