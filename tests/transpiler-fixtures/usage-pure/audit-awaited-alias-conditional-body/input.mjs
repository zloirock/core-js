// alias chain whose deepest body is a TSConditionalType: after type-arg substitution,
// the firing branch must be picked structurally so `Awaited<...Promise<X[]>>` peels to
// `X[]` rather than leaving the conditional unresolved as `Promise<number[]>`
type Cond<X> = X extends string ? never : Promise<X[]>;
type Wrap<Y> = Cond<Y>;
declare const v: Awaited<Wrap<number>>;
v.at(0);
v.findLast(x => true);
