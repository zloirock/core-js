// outer alias's typearg flows through an inner generic into the callback param.
// without nested subst, `p.items` resolves to the raw `U[]` and `.findLast(...)` falls
// back to the generic polyfill instead of the array-specific helper
type Pair<T> = { items: T[] };
type Holder<U> = { use(cb: (p: Pair<U>) => void): void };
declare const h: Holder<number>;
h.use(p => { p.items.findLast(Boolean); });
