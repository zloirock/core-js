import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `Readonly<[T, U]>` aliased to `Pair`; indexing `Pair[0]` resolves through the alias
// to the wrapper, not directly to the tuple. the wrapper must be peeled AFTER following
// the alias chain (the alias node hides it one level deeper); peel-before alone leaves
// the index falling through to generic `_at`.
type Pair = Readonly<[string[], number]>;
declare const xs: Pair[0];
_atMaybeArray(xs).call(xs, 0);