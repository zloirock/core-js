// receiver's type alias substitution must reach the callback parameter's annotation when
// the callback is passed as a call argument. without subst, `items` would resolve to T[]
// (the raw method-signature param) and `.at(0)` fell through to the generic polyfill
type Holder<T> = { use(callback: (item: T[]) => void): void };
declare const h: Holder<number>;
h.use(items => { items.at(0); });
