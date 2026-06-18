// a mapped type whose constraint is a literal union (`{ [K in 'items' | 'name']: V }`) is
// expanded like the `keyof T` form: each member resolves to V. with `Pluck<number[]>` the
// members are `number[]`, so the chained calls dispatch array-specific helpers, not generic
type Pluck<V> = { [K in 'items' | 'name']: V };
declare const r: Pluck<number[]>;
r.items.at(0);
r.name.findLast(x => true);
