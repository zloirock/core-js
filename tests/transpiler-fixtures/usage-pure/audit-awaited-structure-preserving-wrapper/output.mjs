import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Awaited<Required<Promise<X>>>: structure-preserving wrapper around the Awaited arg
// must peel before Promise unwrap so the awaited inner type surfaces. parity with
// `findTypeMember`'s STRUCTURE_PRESERVING_WRAPPERS handling - any wrapper transparent
// at value level shouldn't shadow Awaited's deeper Promise inner
declare const p: Awaited<Required<Promise<number[]>>>;
_includesMaybeArray(p).call(p, 1);