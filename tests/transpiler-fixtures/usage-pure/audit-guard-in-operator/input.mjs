// `'key' in obj` discriminates union by structural shape. plugin's resolver folds union
// branches; heterogeneous `Array | { length: number }` lacks shared
// narrow shape so it collapses to the common type (Object), not Array. dispatch falls back to
// GENERIC `_at` / `_includes` despite Array being one branch. the `in` guard is irrelevant
// to fold semantics - it's runtime narrowing that doesn't propagate to plugin's static fold
declare const r: number[] | { length: number };
if ('flat' in r) {
  r.at(0);
  r.includes(1);
}
