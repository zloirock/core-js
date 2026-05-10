import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Awaited<Required<Readonly<Promise<X>>>>: chain of structure-preserving wrappers
// must peel iteratively until Promise inner surfaces. each Awaited recursion runs
// peelStructurePreservingWrapper, then re-enters with the unwrapped form
declare const p: Awaited<Required<Readonly<Promise<number[]>>>>;
_includesMaybeArray(p).call(p, 1);