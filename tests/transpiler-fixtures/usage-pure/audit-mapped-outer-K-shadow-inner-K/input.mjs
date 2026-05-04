// outer mapped's K binding shadows inner mapped's K. alpha-rename guard in
// `applyAliasSubstDeep` clones the subst and drops the inner-K key before recursing into
// the inner mapped's body / nameType, so outer K-substitution doesn't capture into the
// inner binding. without alpha-rename, `Wrap<T>` substitution `K -> 'a'` would propagate
// into Inner's `[K in keyof T]`, corrupting per-key dispatch
type Inner<T> = { [K in keyof T]: T[K] };
type Wrap<T> = { [K in keyof T]: Inner<{ ['nested_' + K]: T[K] }> };
declare const r: Wrap<{ items: number[]; tail: string[] }>;
r.items.nested_items.at(0);
r.tail.nested_tail.includes('a');
