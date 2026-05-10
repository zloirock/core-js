// Awaited<Required<Readonly<Promise<X>>>>: chain of structure-preserving wrappers
// must peel iteratively until Promise inner surfaces. each Awaited recursion runs
// peelStructurePreservingWrapper, then re-enters with the unwrapped form
declare const p: Awaited<Required<Readonly<Promise<number[]>>>>;
p.includes(1);
