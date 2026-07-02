import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// doubled TS `as` casts on a global member: both wrappers must be peeled to recognise
// the underlying receiver for polyfill rewrite.
_Map$groupBy([], x => x);