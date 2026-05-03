// parseMappedTypeShape requires a TSTypeOperator with operator 'keyof' as constraint.
// Mapped types over a literal union (`{ [K in 'items' | 'name' ]: ... }`) have
// TSUnionType as constraint instead. Resolution falls through to generic dispatch
type Pluck<V> = { [K in 'items' | 'name']: V };
declare const r: Pluck<number[]>;
r.items.at(0);
r.name.findLast(x => true);
