import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// unlike the plain-`Iterator` sibling fixture, `IterableIterator` IS itself a sync iterable - yet a
// `string` is still NOT assignable to it (it requires `.next()` on top of `[Symbol.iterator]`), so
// `T extends IterableIterator<infer U>` takes the FALSE branch (`T` = string). only the minimal
// `Iterable` admits a string check side, not the stricter `.next()`-bearing iterables (Generator /
// IteratorObject behave identically). the conditional is DECIDED: `r` = string, so `r.at()` gets the
// string-specific `_atMaybeString`, never the array `_atMaybeArray` a bound `U[]` would have emitted.
type Bug<T> = T extends IterableIterator<infer U> ? U[] : T;
declare const r: Bug<string>;
_atMaybeString(r).call(r, 0);