import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
// Extract with a UNION target. TS distributes Extract<U, A | B> as Extract<U, A> | Extract<U, B>,
// and so does the resolver: each source member is asked about every target ARM, not about their
// folded shape. `Set<number>` is the member that decides the answer here - no arm shares its
// constructor, and two different known constructors are NOT a decidable pair (subtype relations
// between them exist, `Array extends Iterable` among them). an undecidable member sinks the whole
// result rather than being guessed either way, so the receiver keeps the generic helper.
type Pool = number[] | string[] | Set<number>;
type Narrowed = Extract<Pool, number[] | string[]>;
declare const arr: Narrowed;
const first = _at(arr).call(arr, 0);
const found = _findLastMaybeArray(arr).call(arr, x => true);
export { first, found };