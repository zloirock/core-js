// `IterableIterator` IS itself a sync iterable, yet a `string` is still NOT assignable to it
// (it needs `.next()` on top of `[Symbol.iterator]`), so `T extends IterableIterator<infer U>`
// takes the FALSE branch (`T` = string). only the minimal `Iterable` admits a string side, not
// `.next()`-bearing iterables. so `r.at()` gets `_atMaybeString`, never the array variant.
type Bug<T> = T extends IterableIterator<infer U> ? U[] : T;
declare const r: Bug<string>;
r.at(0);
