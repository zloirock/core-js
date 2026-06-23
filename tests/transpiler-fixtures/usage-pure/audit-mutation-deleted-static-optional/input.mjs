// `delete Array.from; Array.from?.(...)` deletes a static whose substitution then bails (usage-pure keeps
// the native member to honor the patch), so the optional `?.` MUST survive - dropping it would call the
// deleted slot unconditionally (throws) where the native chain short-circuits to undefined. an UNMUTATED
// `Array.of?.(...)` still deopts (drops the guard, substitutes the always-defined import), proving the
// guard is kept only for the mutated slot. a downstream polyfilled `.at()` / `.includes()` drives the
// call-split that exposed the dropped guard.
delete Array.from;
const r1 = Array.from?.([1]).at(0);
const r2 = Array.of?.(1, 2).includes(2);
export { r1, r2 };
