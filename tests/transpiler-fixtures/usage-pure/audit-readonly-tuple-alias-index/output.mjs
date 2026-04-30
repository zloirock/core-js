import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// alias of structure-preserving wrapper around tuple: `Readonly<[T, U]>` aliased to `Pair`.
// indexing `Pair[0]` resolves through the alias to the wrapper, NOT directly to the tuple.
// `findTupleElement` must peel the wrapper AFTER following the alias chain - peel-before
// alone fails because the alias node hides the wrapper one level deeper. without the
// post-follow peel, the index falls through to generic `_at`
type Pair = Readonly<[string[], number]>;
declare const xs: Pair[0];
_atMaybeArray(xs).call(xs, 0);