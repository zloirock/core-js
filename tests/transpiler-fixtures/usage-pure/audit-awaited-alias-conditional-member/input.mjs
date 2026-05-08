// `Awaited<Cond<T>>` wraps a multi-hop conditional that resolves to an object with array fields.
// Conditional branch picking must fire so member access on the resolved object narrows precisely.
type Cond<X> = X extends string ? never : { items: X[]; tags: string[] };
type Wrap<Y> = Cond<Y>;
declare const r: Awaited<Wrap<number>>;
r.items.at(0);
r.tags.includes('x');
